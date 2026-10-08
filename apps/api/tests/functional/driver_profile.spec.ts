import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#models/user'
import DriverProfile from '#models/driver_profile'
import { dataOf, makeLoad, makeUser } from '#tests/helpers'

test.group('Driver profile', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a new driver must give a licence number to create their profile', async ({ client }) => {
    const driver = await User.create({
      phone: '+256772999001',
      role: 'driver',
      market: 'UG',
      phoneVerifiedAt: DateTime.now(),
    })

    const missing = await client
      .put('/api/v1/me/driver-profile')
      .json({ dutyStatus: 'AVAILABLE' })
      .loginAs(driver)
    missing.assertStatus(422)
    missing.assertBodyContains({ errors: [{ code: 'E_LICENSE_REQUIRED' }] })

    const created = await client
      .put('/api/v1/me/driver-profile')
      .json({ licenseNumber: 'UG-DL-12345', licenseClass: 'CE' })
      .loginAs(driver)
    created.assertBodyContains({
      data: { driverProfile: { licenseNumber: 'UG-DL-12345', verificationStatus: 'PENDING' } },
    })
  })

  test('going on and off duty does not need the licence again', async ({ client }) => {
    const driver = await makeUser('driver')
    const toggled = await client
      .put('/api/v1/me/driver-profile')
      .json({ dutyStatus: 'OFF_DUTY' })
      .loginAs(driver)
    toggled.assertBodyContains({ data: { driverProfile: { dutyStatus: 'OFF_DUTY' } } })
  })

  test('completing a load counts towards the driver’s trips', async ({ client, assert }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
    await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)
    await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mtn' }).loginAs(shipper)
    await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'IN_TRANSIT' })
      .loginAs(driver)
    await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'DELIVERED' })
      .loginAs(driver)
    const { code } = dataOf(
      await client.post(`/api/v1/loads/${load.id}/release-code`).loginAs(shipper)
    )
    await client.post(`/api/v1/loads/${load.id}/release`).json({ code }).loginAs(driver)

    assert.equal((await DriverProfile.findByOrFail('userId', driver.id)).completedTrips, 1)
  })
})
