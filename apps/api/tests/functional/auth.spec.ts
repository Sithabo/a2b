import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import { dataOf, nextPhone } from '#tests/helpers'
import User from '#models/user'
import otpConfig from '#config/otp'
import { swapTwilioVerify } from '#services/otp_service'

// +256700000001 is an OTP test number with the fixed code 123456 (see .env)
const TEST_PHONE = '+256700000001'

test.group('Auth / phone OTP', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear())

  test('rejects numbers outside Guyana and Uganda', async ({ client }) => {
    const response = await client.post('/api/v1/auth/otp').json({ phone: '+254712345678' })
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_UNSUPPORTED_MARKET' }] })
  })

  test('requires a role the first time a number signs in', async ({ client }) => {
    await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    const response = await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456' })
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_ROLE_REQUIRED' }] })
  })

  test("a missing role doesn't use up the code", async ({ client }) => {
    await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    await client.post('/api/v1/auth/verify').json({ phone: TEST_PHONE, code: '123456' })
    const retry = await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456', role: 'driver' })
    retry.assertStatus(200)
  })

  test('creates the account with the market from the phone number', async ({ client, assert }) => {
    await client.post('/api/v1/auth/otp').json({ phone: '0700 000 001'.replace(/^0/, '+256') })
    const response = await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456', role: 'shipper' })

    response.assertStatus(200)
    response.assertBodyContains({
      data: { isNewUser: true, user: { role: 'shipper', market: 'UG' } },
    })
    assert.isString(dataOf(response).token)

    const me = await client.get('/api/v1/me').bearerToken(dataOf(response).token)
    me.assertBodyContains({ data: { phone: TEST_PHONE } })
  })

  test('a wrong code is rejected and counted; the right one still works after', async ({
    client,
    assert,
  }) => {
    await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    const wrong = await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '000000', role: 'driver' })
    wrong.assertStatus(422)
    wrong.assertBodyContains({ errors: [{ code: 'E_OTP_INVALID' }] })

    const right = await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456', role: 'driver' })
    right.assertStatus(200)
    assert.equal((await User.findByOrFail('phone', TEST_PHONE)).role, 'driver')
  })

  test('signing in returns the profile the app routes on', async ({ client }) => {
    await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456', role: 'driver' })
    const user = await User.findByOrFail('phone', TEST_PHONE)
    await user.related('driverProfile').create({
      licenseNumber: 'UG-123456',
      verificationStatus: 'PENDING',
      dutyStatus: 'OFF_DUTY',
      completedTrips: 0,
    })

    await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    const response = await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456', role: 'driver' })
    response.assertBodyContains({
      data: { isNewUser: false, user: { driverProfile: { licenseNumber: 'UG-123456' } } },
    })
  })

  test('a code cannot be used twice', async ({ client }) => {
    await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456', role: 'shipper' })
    const reuse = await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456' })
    reuse.assertStatus(422)
    reuse.assertBodyContains({ errors: [{ code: 'E_OTP_EXPIRED' }] })
  })

  test('limits how many codes a number can request', async ({ client }) => {
    for (let i = 0; i < 3; i++) await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    const response = await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    response.assertStatus(429)
  })

  test('outside production the code comes back in the response and signs you in', async ({
    client,
    assert,
  }) => {
    const phone = '+256772555111' // not a test number: a random code is generated
    const requested = await client.post('/api/v1/auth/otp').json({ phone })
    const devCode = dataOf(requested).devCode
    assert.match(devCode, /^\d{6}$/)

    const verified = await client
      .post('/api/v1/auth/verify')
      .json({ phone, code: devCode, role: 'shipper' })
    verified.assertStatus(200)
  })

  test('the code is only returned when explicitly enabled', async ({ client, assert }) => {
    const enabled = otpConfig.exposeCodes
    otpConfig.exposeCodes = false
    try {
      const response = await client.post('/api/v1/auth/otp').json({ phone: '+256772555112' })
      response.assertStatus(200)
      assert.notProperty(dataOf(response), 'devCode')
    } finally {
      otpConfig.exposeCodes = enabled
    }
  })

  test('limits how many codes one network can request', async ({ client }) => {
    // Different numbers each time, so only the per-IP limit applies
    for (let i = 0; i < 20; i++) {
      ;(await client.post('/api/v1/auth/otp').json({ phone: nextPhone('UG') })).assertStatus(200)
    }
    const response = await client.post('/api/v1/auth/otp').json({ phone: nextPhone('UG') })
    response.assertStatus(429)
  })

  test('protected routes need a token', async ({ client }) => {
    const response = await client.get('/api/v1/me')
    response.assertStatus(401)
  })
})

test.group('Auth / testers outside the markets', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear())

  // +14055550100 is listed in OTP_TESTER_PHONES with market UG (see .env.test)
  test('a listed US number signs in with its configured market', async ({ client, assert }) => {
    const phone = '+14055550100'
    const requested = await client.post('/api/v1/auth/otp').json({ phone })
    requested.assertStatus(200)
    const verified = await client
      .post('/api/v1/auth/verify')
      .json({ phone, code: dataOf(requested).devCode, role: 'shipper' })
    verified.assertStatus(200)
    assert.equal(dataOf(verified).user.market, 'UG')
  })

  test('other US numbers are still turned away', async ({ client }) => {
    const response = await client.post('/api/v1/auth/otp').json({ phone: '+14055550199' })
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_UNSUPPORTED_MARKET' }] })
  })
})

test.group('Auth / Twilio Verify', (group) => {
  const sent: string[] = []
  const fake = {
    async start(phone: string) {
      sent.push(phone)
    },
    async check(_phone: string, code: string) {
      // Like Twilio: an approved verification can't be checked again
      if (code !== '424242') return 'invalid' as const
      return fake.used ? ('expired' as const) : ((fake.used = true), 'approved' as const)
    },
    used: false,
  }

  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear())
  group.each.setup(() => {
    const driver = otpConfig.driver
    sent.length = 0
    fake.used = false
    otpConfig.driver = 'twilio_verify'
    swapTwilioVerify(fake)
    return () => {
      otpConfig.driver = driver
      swapTwilioVerify(undefined)
    }
  })

  test('Twilio sends the code and the API never sees it', async ({ client, assert }) => {
    const phone = nextPhone('GY')
    const requested = await client.post('/api/v1/auth/otp').json({ phone })
    requested.assertStatus(200)
    assert.deepEqual(sent, [phone])
    assert.notProperty(dataOf(requested), 'devCode')

    const wrong = await client
      .post('/api/v1/auth/verify')
      .json({ phone, code: '000000', role: 'driver' })
    wrong.assertBodyContains({ errors: [{ code: 'E_OTP_INVALID' }] })

    const right = await client
      .post('/api/v1/auth/verify')
      .json({ phone, code: '424242', role: 'driver' })
    right.assertStatus(200)
  })

  test('a code Twilio approved still works after a missing role', async ({ client }) => {
    const phone = nextPhone('UG')
    await client.post('/api/v1/auth/otp').json({ phone })
    const noRole = await client.post('/api/v1/auth/verify').json({ phone, code: '424242' })
    noRole.assertBodyContains({ errors: [{ code: 'E_ROLE_REQUIRED' }] })

    const retry = await client
      .post('/api/v1/auth/verify')
      .json({ phone, code: '424242', role: 'shipper' })
    retry.assertStatus(200)

    const reused = await client
      .post('/api/v1/auth/verify')
      .json({ phone, code: '424242', role: 'shipper' })
    reused.assertBodyContains({ errors: [{ code: 'E_OTP_EXPIRED' }] })
  })

  test('test numbers keep their fixed code without calling Twilio', async ({ client, assert }) => {
    await client.post('/api/v1/auth/otp').json({ phone: TEST_PHONE })
    assert.deepEqual(sent, [])
    const verified = await client
      .post('/api/v1/auth/verify')
      .json({ phone: TEST_PHONE, code: '123456', role: 'driver' })
    verified.assertStatus(200)
  })

  test('a failed send is reported as such, not as a server error', async ({ client }) => {
    swapTwilioVerify({
      ...fake,
      async start() {
        throw new Error('Twilio is down')
      },
    })
    const response = await client.post('/api/v1/auth/otp').json({ phone: nextPhone('GY') })
    response.assertStatus(502)
    response.assertBodyContains({ errors: [{ code: 'E_SMS_FAILED' }] })
  })
})
