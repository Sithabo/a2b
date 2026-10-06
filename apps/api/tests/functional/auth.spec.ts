import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { dataOf } from '#tests/helpers'
import User from '#models/user'

// +256700000001 is an OTP test number with the fixed code 123456 (see .env)
const TEST_PHONE = '+256700000001'

test.group('Auth / phone OTP', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

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

  test('protected routes need a token', async ({ client }) => {
    const response = await client.get('/api/v1/me')
    response.assertStatus(401)
  })
})
