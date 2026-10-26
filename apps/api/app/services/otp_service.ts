import { randomInt } from 'node:crypto'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { marketFromPhone, type MarketCode } from '@a2b/core'
import { parsePhoneNumberFromString } from 'libphonenumber-js/min'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import otpConfig from '#config/otp'
import PhoneOtp from '#models/phone_otp'
import DomainError from '#exceptions/domain_error'
import { sms } from '#services/sms/index'
import { requireTwilio } from '#services/twilio/index'
import TwilioVerify from '#services/otp/twilio_verify'

const CODE_TTL_MINUTES = 10
const MAX_SENDS_PER_WINDOW = 3
const SEND_WINDOW_MINUTES = 10
const MAX_VERIFY_ATTEMPTS = 5

/** Fixed codes for test numbers. Never honoured in production. */
function testCodeFor(phone: string) {
  return app.inProduction ? undefined : otpConfig.testNumbers.get(phone)
}

/** Twilio Verify when OTP_DRIVER=twilio_verify; built on first use so dev needs no Twilio account. */
let verifyService: TwilioVerify | undefined
function twilioVerify() {
  if (!verifyService) {
    const serviceSid = env.get('TWILIO_VERIFY_SERVICE_SID')
    if (!serviceSid) throw new Error('OTP_DRIVER=twilio_verify needs TWILIO_VERIFY_SERVICE_SID')
    verifyService = new TwilioVerify(requireTwilio('OTP_DRIVER=twilio_verify'), serviceSid)
  }
  return verifyService
}

/** Tests: stand in for Twilio Verify (pass undefined to go back to the real one). */
export function swapTwilioVerify(fake: Pick<TwilioVerify, 'start' | 'check'> | undefined) {
  verifyService = fake as TwilioVerify | undefined
}

/** Sends the text, reporting a provider failure as "couldn't send" rather than a server error. */
async function deliver(send: () => Promise<void>, phone: string) {
  try {
    await send()
  } catch (error) {
    logger.error({ err: error, phone }, '[otp] code not sent')
    throw new DomainError("We couldn't send a code to this number. Check it and try again.", {
      status: 502,
      code: 'E_SMS_FAILED',
    })
  }
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
  const market = marketFromPhone(parsed.number) ?? otpConfig.testerMarkets.get(parsed.number)
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
  const fixedCode = testCodeFor(phone)
  // With Twilio Verify, Twilio makes and keeps the code; we only track the attempt
  const viaTwilio = !fixedCode && otpConfig.driver === 'twilio_verify'
  const code = viaTwilio ? null : (fixedCode ?? String(randomInt(0, 1_000_000)).padStart(6, '0'))
  const codeHash = code ? await hash.make(code) : null

  await db.transaction(async (trx) => {
    // Serialise requests for this number so parallel calls can't all pass the count check
    await trx.rawQuery('SELECT pg_advisory_xact_lock(hashtext(?))', [`otp:${phone}`])
    const recent = await PhoneOtp.query({ client: trx })
      .where('phone', phone)
      .where('created_at', '>', DateTime.now().minus({ minutes: SEND_WINDOW_MINUTES }).toSQL()!)
      .count('* as total')
    if (Number(recent[0].$extras.total) >= MAX_SENDS_PER_WINDOW) {
      throw DomainError.tooMany('Too many codes requested. Try again in a few minutes.')
    }
    await PhoneOtp.create(
      {
        phone,
        codeHash,
        attempts: 0,
        expiresAt: DateTime.now().plus({ minutes: CODE_TTL_MINUTES }),
      },
      { client: trx }
    )
  })

  if (viaTwilio) {
    await deliver(() => twilioVerify().start(phone), phone)
  } else if (!fixedCode) {
    await deliver(
      () => sms.send(phone, `Your A2B code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`),
      phone
    )
  }

  return {
    phone,
    expiresInSeconds: CODE_TTL_MINUTES * 60,
    // Lets dev builds show the code on screen. Off unless OTP_EXPOSE_CODES is set
    // with the log SMS driver, and never in production.
    ...(otpConfig.exposeCodes && code && !app.inProduction ? { devCode: code } : {}),
  }
}

type VerifyOutcome<T> =
  | { ok: true; value: T }
  | { ok: false; error: 'expired' | 'locked' | 'invalid' }
  | { ok: false; error: 'rejected'; cause: unknown }

/**
 * Checks the latest code for the phone and, if it matches, consumes it and
 * runs `onVerified` in the same transaction.
 *
 * The code's row is locked for the whole check, so parallel requests are
 * handled one at a time: wrong guesses can't exceed the attempt limit and a
 * code can't be used twice. If `onVerified` throws (say the sign-up is
 * missing a role), the code is not consumed and can be retried.
 */
export async function verifyOtp<T>(
  input: string,
  code: string,
  onVerified: (phone: NormalizedPhone, trx: TransactionClientContract) => Promise<T>
): Promise<T> {
  const normalized = normalizePhone(input)

  const outcome = await db.transaction(async (trx): Promise<VerifyOutcome<T>> => {
    // Only the most recent code counts; asking for a new one retires older ones.
    const otp = await PhoneOtp.query({ client: trx })
      .where('phone', normalized.phone)
      .where('expires_at', '>', DateTime.now().toSQL()!)
      .orderBy('id', 'desc')
      .forUpdate()
      .first()

    if (!otp || otp.consumedAt) return { ok: false, error: 'expired' }
    if (otp.attempts >= MAX_VERIFY_ATTEMPTS) return { ok: false, error: 'locked' }

    otp.useTransaction(trx)
    let result: 'approved' | 'invalid' | 'expired'
    if (otp.codeHash) {
      result = (await hash.verify(otp.codeHash, code)) ? 'approved' : 'invalid'
    } else {
      // Sent with Twilio Verify, which checks it. An approved check spends the
      // code at Twilio, so keep its hash: a retry after `onVerified` fails is checked here.
      result = await twilioVerify().check(normalized.phone, code)
      if (result === 'approved') otp.codeHash = await hash.make(code)
    }
    if (result === 'expired') return { ok: false, error: 'expired' }
    if (result === 'invalid') {
      otp.attempts += 1
      await otp.save() // committed: the wrong guess counts even though we report an error
      return { ok: false, error: 'invalid' }
    }

    await otp.save() // a Twilio code's hash, kept even if the sign-in below fails
    // Run the sign-in in a savepoint so a failure leaves the code unspent
    const savepoint = await trx.transaction()
    try {
      otp.useTransaction(savepoint)
      otp.consumedAt = DateTime.now()
      await otp.save()
      const value = await onVerified(normalized, savepoint)
      await savepoint.commit()
      return { ok: true, value }
    } catch (cause) {
      await savepoint.rollback()
      return { ok: false, error: 'rejected', cause }
    }
  })

  if (outcome.ok) return outcome.value
  switch (outcome.error) {
    case 'expired':
      throw DomainError.invalid('This code has expired. Request a new one.', 'E_OTP_EXPIRED')
    case 'locked':
      throw DomainError.tooMany('Too many wrong codes. Request a new one.')
    case 'invalid':
      throw DomainError.invalid('That code is not correct', 'E_OTP_INVALID')
    case 'rejected':
      throw outcome.cause
  }
}
