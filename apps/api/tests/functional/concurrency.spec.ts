import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import Fleet from '#models/fleet'
import PhoneOtp from '#models/phone_otp'
import User from '#models/user'
import { makeUser } from '#tests/helpers'

/**
 * Parallel requests, as a double-tap or a script would send them. These need
 * real separate connections, so the tables are truncated instead of wrapped
 * in a global transaction.
 */
test.group('Concurrent requests', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => limiter.clear())

  // OTP test numbers with the fixed code 123456 (see .env)
  const PHONE_A = '+256700000002'
  const PHONE_B = '+256700000003'

  test('parallel wrong guesses still stop at the attempt limit', async ({ client, assert }) => {
    await client.post('/api/v1/auth/otp').json({ phone: PHONE_A })
    const guesses = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        client
          .post('/api/v1/auth/verify')
          .json({ phone: PHONE_A, code: String(100000 + i), role: 'shipper' })
      )
    )
    const statuses = guesses.map((r) => r.status())
    assert.equal(statuses.filter((s) => s === 422).length, 5)
    assert.equal(statuses.filter((s) => s === 429).length, 7)

    const otp = await PhoneOtp.query().where('phone', PHONE_A).firstOrFail()
    assert.equal(otp.attempts, 5)

    // Even the right code is refused once the limit is hit
    const right = await client
      .post('/api/v1/auth/verify')
      .json({ phone: PHONE_A, code: '123456', role: 'shipper' })
    right.assertStatus(429)
  })

  test('a double-submitted code signs in once and creates one account', async ({
    client,
    assert,
  }) => {
    await client.post('/api/v1/auth/otp').json({ phone: PHONE_B })
    const [first, second] = await Promise.all(
      [1, 2].map(() =>
        client.post('/api/v1/auth/verify').json({ phone: PHONE_B, code: '123456', role: 'shipper' })
      )
    )
    assert.sameMembers([first.status(), second.status()], [200, 422])
    assert.lengthOf(await User.query().where('phone', PHONE_B), 1)
  })

  test('parallel code requests respect the per-number limit', async ({ client, assert }) => {
    const responses = await Promise.all(
      Array.from({ length: 6 }, () => client.post('/api/v1/auth/otp').json({ phone: PHONE_A }))
    )
    const statuses = responses.map((r) => r.status())
    assert.equal(statuses.filter((s) => s === 200).length, 3)
    assert.equal(statuses.filter((s) => s === 429).length, 3)
  })

  test('a double-tapped fleet setup creates one fleet', async ({ client, assert }) => {
    const owner = await makeUser('fleet_owner')
    const responses = await Promise.all(
      [1, 2, 3].map(() =>
        client
          .post('/api/v1/fleet')
          .json({ name: 'Apex Logistics', sizeTier: '1-5' })
          .loginAs(owner)
      )
    )
    assert.sameMembers(
      responses.map((r) => r.status()),
      [201, 409, 409]
    )
    assert.lengthOf(await Fleet.query().where('owner_id', owner.id), 1)
  })
})
