import { test } from '@japa/runner'
import TwilioClient from '#services/twilio/twilio_client'
import TwilioVerify from '#services/otp/twilio_verify'
import TwilioSmsDriver from '#services/sms/twilio_sms_driver'

function fakeFetch(status: number, body: object) {
  const calls: { url: string; init: RequestInit }[] = []
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify(body), { status })
  }) as unknown as typeof fetch
  return { calls, impl }
}

const credentials = { accountSid: 'AC123', authToken: 'secret' }

test.group('Twilio', () => {
  test('Verify starts an SMS verification with basic auth', async ({ assert }) => {
    const fetch = fakeFetch(201, { status: 'pending' })
    await new TwilioVerify(new TwilioClient(credentials, fetch.impl), 'VA1').start('+5926001234')

    const [call] = fetch.calls
    assert.equal(call.url, 'https://verify.twilio.com/v2/Services/VA1/Verifications')
    const headers = call.init.headers as Record<string, string>
    assert.equal(headers.Authorization, `Basic ${Buffer.from('AC123:secret').toString('base64')}`)
    assert.equal(String(call.init.body), 'To=%2B5926001234&Channel=sms')
  })

  test('Verify maps check results', async ({ assert }) => {
    const check = (status: number, body: object) =>
      new TwilioVerify(new TwilioClient(credentials, fakeFetch(status, body).impl), 'VA1').check(
        '+14055550100',
        '123456'
      )
    assert.equal(await check(200, { status: 'approved' }), 'approved')
    assert.equal(await check(200, { status: 'pending' }), 'invalid')
    assert.equal(await check(404, { code: 20404, message: 'not found' }), 'expired')
    await assert.rejects(() => check(401, { code: 20003, message: 'auth' }))
  })

  test('messages go out from the messaging service', async ({ assert }) => {
    const fetch = fakeFetch(201, { sid: 'SM1' })
    const client = new TwilioClient({ ...credentials, apiKeySid: 'SK1' }, fetch.impl)
    await new TwilioSmsDriver(client, { messagingServiceSid: 'MG1' }).send('+256772000111', 'Hi')

    const [call] = fetch.calls
    assert.equal(call.url, 'https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json')
    const form = new URLSearchParams(String(call.init.body))
    assert.equal(form.get('MessagingServiceSid'), 'MG1')
    assert.equal(form.get('Body'), 'Hi')
    const headers = call.init.headers as Record<string, string>
    assert.equal(headers.Authorization, `Basic ${Buffer.from('SK1:secret').toString('base64')}`)
  })
})
