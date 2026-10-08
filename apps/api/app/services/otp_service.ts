import { randomInt } from 'node:crypto'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { marketFromPhone, type MarketCode } from '@a2b/core'
import { parsePhoneNumberFromString } from 'libphonenumber-js/min'
import PhoneOtp from '#models/phone_otp'
import DomainError from '#exceptions/domain_error'
import { sms } from '#services/sms/index'

const CODE_TTL_MINUTES = 10
const MAX_SENDS_PER_WINDOW = 3
const SEND_WINDOW_MINUTES = 10
const MAX_VERIFY_ATTEMPTS = 5

/** "+256700000001=123456,+5926000001=123456" → Map. Ignored in production. */
function testNumbers(): Map<string, string> {
  if (app.inProduction) return new Map()
  const pairs = (env.get('OTP_TEST_NUMBERS') ?? '').split(',').filter(Boolean)
  return new Map(pairs.map((pair) => pair.trim().split('=') as [string, string]))
}

export interface NormalizedPhone {
  phone: string
  market: MarketCode
}

/** Validates a phone number and confirms it's in a market A2B serves. */
export function normalizePhone(input: string): NormalizedPhone {
  const parsed = parsePhoneNumberFromString(input)
  if (!parsed?.isValid()) {
    throw DomainError.invalid(
      'Enter a valid phone number including the country code',
      'E_INVALID_PHONE'
    )
  }
  const market = marketFromPhone(parsed.number)
  if (!market) {
    throw DomainError.invalid(
      'A2B is currently available in Guyana and Uganda',
      'E_UNSUPPORTED_MARKET'
    )
  }
  return { phone: parsed.number, market }
}

export async function requestOtp(input: string) {
  const { phone } = normalizePhone(input)

  const recent = await PhoneOtp.query()
    .where('phone', phone)
    .where('created_at', '>', DateTime.now().minus({ minutes: SEND_WINDOW_MINUTES }).toSQL()!)
    .count('* as total')
  if (Number(recent[0].$extras.total) >= MAX_SENDS_PER_WINDOW) {
    throw DomainError.tooMany('Too many codes requested. Try again in a few minutes.')
  }

  const fixedCode = testNumbers().get(phone)
  const code = fixedCode ?? String(randomInt(0, 1_000_000)).padStart(6, '0')

  await PhoneOtp.create({
    phone,
    codeHash: await hash.make(code),
    attempts: 0,
    expiresAt: DateTime.now().plus({ minutes: CODE_TTL_MINUTES }),
  })

  if (!fixedCode) {
    await sms.send(phone, `Your A2B code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`)
  }

  return { phone, expiresInSeconds: CODE_TTL_MINUTES * 60 }
}

/** Consumes the latest valid code for the phone or throws. */
export async function verifyOtp(input: string, code: string): Promise<NormalizedPhone> {
  const normalized = normalizePhone(input)

  const otp = await PhoneOtp.query()
    .where('phone', normalized.phone)
    .whereNull('consumed_at')
    .where('expires_at', '>', DateTime.now().toSQL()!)
    .orderBy('id', 'desc')
    .first()

  if (!otp) throw DomainError.invalid('This code has expired. Request a new one.', 'E_OTP_EXPIRED')
  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw DomainError.tooMany('Too many wrong codes. Request a new one.')
  }

  if (!(await hash.verify(otp.codeHash, code))) {
    otp.attempts += 1
    await otp.save()
    throw DomainError.invalid('That code is not correct', 'E_OTP_INVALID')
  }

  otp.consumedAt = DateTime.now()
  await otp.save()
  return normalized
}
