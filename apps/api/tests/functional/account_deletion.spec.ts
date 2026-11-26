import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import Load from '#models/load'
import LoadEvent from '#models/load_event'
import Fleet from '#models/fleet'
import DriverProfile from '#models/driver_profile'
import ShipperProfile from '#models/shipper_profile'
import type { LoadStatus } from '@a2b/core'
import { dataOf, makeLoad, makeUser, nextPhone } from '#tests/helpers'

/** Puts a load straight into a status, with a driver attached when one is given. */
async function setStatus(load: Load, status: LoadStatus, driver?: User) {
  load.merge({ status, driverId: driver?.id ?? load.driverId })
  await load.save()
  return load
}

test.group('Account deletion', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear())

  test('a shipper with past shipments is anonymised, keeping the load history', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const phone = shipper.phone
    const load = await setStatus(await makeLoad(shipper), 'COMPLETED')

    const response = await client.delete('/api/v1/me').loginAs(shipper)
    response.assertStatus(200)

    const anonymised = await User.findOrFail(shipper.id)
    assert.equal(anonymised.phone, `deleted:${shipper.id}`)
    assert.isNull(anonymised.fullName)
    assert.isNull(await ShipperProfile.findBy('userId', shipper.id))
    assert.equal((await Load.findOrFail(load.id)).shipperId, shipper.id)

    // The number is free again and signs up as a brand-new account
    await client.post('/api/v1/auth/otp').json({ phone })
    assert.isNull(await User.findBy('phone', phone))
  })

  test('the token stops working once the account is deleted', async ({ client }) => {
    await client.post('/api/v1/auth/otp').json({ phone: '+256700000001' })
    const verified = await client
      .post('/api/v1/auth/verify')
      .json({ phone: '+256700000001', code: '123456', role: 'shipper' })
    const token = dataOf(verified).token as string
    await makeLoad(await User.findByOrFail('phone', '+256700000001'))

    ;(await client.delete('/api/v1/me').bearerToken(token)).assertStatus(200)
    ;(await client.get('/api/v1/me').bearerToken(token)).assertStatus(401)
  })

  test('a shipment in progress blocks deletion and nothing is touched', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    await setStatus(await makeLoad(shipper), 'MATCHED', driver)

    const response = await client.delete('/api/v1/me').loginAs(shipper)
    response.assertStatus(409)
    response.assertBodyContains({ errors: [{ code: 'E_ACCOUNT_HAS_ACTIVE_LOADS' }] })
    assert.equal((await User.findOrFail(shipper.id)).phone, shipper.phone)
    assert.isNotNull(await ShipperProfile.findBy('userId', shipper.id))
  })

  test('drafts and loads still on the board are cancelled', async ({ client, assert }) => {
    const shipper = await makeUser('shipper')
    const open = await makeLoad(shipper)
    const draft = await setStatus(await makeLoad(shipper), 'DRAFT')
    if (open.status !== 'OPEN') await setStatus(open, 'OPEN')

    ;(await client.delete('/api/v1/me').loginAs(shipper)).assertStatus(200)

    for (const load of [open, draft]) {
      assert.equal((await Load.findOrFail(load.id)).status, 'CANCELLED')
      const event = await LoadEvent.query().where('load_id', load.id).orderBy('id', 'desc').first()
      assert.equal(event?.note, 'Shipper deleted their account')
    }
  })

  test('a driver on the road cannot delete their account', async ({ client }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    await setStatus(await makeLoad(shipper), 'IN_TRANSIT', driver)

    const response = await client.delete('/api/v1/me').loginAs(driver)
    response.assertStatus(409)
    response.assertBodyContains({ errors: [{ code: 'E_ACCOUNT_HAS_ACTIVE_LOADS' }] })
  })

  test('a driver with finished trips is anonymised and their profile removed', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const load = await setStatus(await makeLoad(shipper), 'COMPLETED', driver)

    ;(await client.delete('/api/v1/me').loginAs(driver)).assertStatus(200)
    assert.isNull(await DriverProfile.findBy('userId', driver.id))
    assert.equal((await Load.findOrFail(load.id)).driverId, driver.id)
    assert.isNull((await User.findOrFail(driver.id)).fullName)
  })

  test("a fleet owner's drivers are released and the fleet kept for history", async ({
    client,
    assert,
  }) => {
    const owner = await makeUser('fleet_owner')
    await client
      .post('/api/v1/fleet')
      .json({ name: 'Apex Logistics', sizeTier: '1-5' })
      .loginAs(owner)
    const added = await client
      .post('/api/v1/fleet/drivers')
      .json({ phone: nextPhone('UG'), fullName: 'John Mukasa' })
      .loginAs(owner)
    const driverId: number = dataOf(added).driver.id

    ;(await client.delete('/api/v1/me').loginAs(owner)).assertStatus(200)
    assert.isNotNull(await Fleet.findBy('ownerId', owner.id))
    assert.isNull((await DriverProfile.findByOrFail('userId', driverId)).fleetId)
    assert.equal((await User.findOrFail(owner.id)).phone, `deleted:${owner.id}`)
  })

  test("a fleet's shipment in progress blocks the owner's deletion", async ({ client }) => {
    const owner = await makeUser('fleet_owner')
    await client
      .post('/api/v1/fleet')
      .json({ name: 'Apex Logistics', sizeTier: '1-5' })
      .loginAs(owner)
    const fleet = await Fleet.findByOrFail('ownerId', owner.id)
    const load = await makeLoad(await makeUser('shipper'))
    load.merge({ status: 'SECURED', fleetId: fleet.id })
    await load.save()

    const response = await client.delete('/api/v1/me').loginAs(owner)
    response.assertStatus(409)
  })
})
