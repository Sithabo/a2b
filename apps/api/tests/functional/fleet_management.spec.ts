import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import DriverProfile from '#models/driver_profile'
import Vehicle from '#models/vehicle'
import FleetInvite from '#models/fleet_invite'
import type User from '#models/user'
import { makeLoad, makeUser, nextPhone, dataOf, JPEG_BYTES } from '#tests/helpers'
import type { ApiClient } from '@japa/api-client'

/** A fleet with one driver on one truck. */
async function fleetWithTruck(client: ApiClient, plate = 'UAM 456K') {
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
  const truck = await client
    .post('/api/v1/fleet/vehicles')
    .json({
      plate,
      make: 'Mitsubishi',
      model: 'Fuso Fighter',
      vehicleClass: 'LORRY',
      bodyType: 'DRY_BOX',
      capacityTons: 10,
      assignedDriverId: driverId,
    })
    .loginAs(owner)
  return { owner, driverId, vehicleId: dataOf(truck).id as number }
}

async function dispatch(client: ApiClient, owner: User, vehicleId: number) {
  const shipper = await makeUser('shipper')
  const load = await makeLoad(shipper)
  await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
  await client.post(`/api/v1/loads/${load.id}/accept`).json({ vehicleId }).loginAs(owner)
  return { shipper, load }
}

test.group('Fleet management', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('the owner edits the fleet but not its market', async ({ client }) => {
    const { owner } = await fleetWithTruck(client)
    const response = await client
      .patch('/api/v1/fleet')
      .json({ name: 'Apex Haulage', primaryCorridor: 'Kampala – Mombasa', market: 'GY' })
      .loginAs(owner)
    response.assertStatus(200)
    response.assertBodyContains({
      data: { name: 'Apex Haulage', primaryCorridor: 'Kampala – Mombasa', market: 'UG' },
    })

    const badTin = await client.patch('/api/v1/fleet').json({ taxId: '12' }).loginAs(owner)
    badTin.assertBodyContains({ errors: [{ code: 'E_INVALID_TAX_ID' }] })
  })

  test('truck details can be edited; plates stay unique', async ({ client }) => {
    const { owner, vehicleId } = await fleetWithTruck(client)
    const other = await client
      .post('/api/v1/fleet/vehicles')
      .json({
        plate: 'UBH 892K',
        make: 'Isuzu',
        model: 'FVZ',
        vehicleClass: 'LORRY',
        bodyType: 'FLATBED',
        capacityTons: 15,
      })
      .loginAs(owner)

    const edited = await client
      .patch(`/api/v1/fleet/vehicles/${vehicleId}`)
      .json({ plate: 'uam 456k', model: 'Fuso Super Great', capacityTons: 12 })
      .loginAs(owner)
    edited.assertBodyContains({
      data: { plate: 'UAM 456K', model: 'Fuso Super Great', capacityTons: 12 },
    })

    const clash = await client
      .patch(`/api/v1/fleet/vehicles/${dataOf(other).id}`)
      .json({ plate: 'UAM 456K' })
      .loginAs(owner)
    clash.assertBodyContains({ errors: [{ code: 'E_PLATE_TAKEN' }] })
  })

  test('a truck on a job cannot be deleted; an idle one can', async ({ client, assert }) => {
    const { owner, vehicleId } = await fleetWithTruck(client)
    const { load } = await dispatch(client, owner, vehicleId)

    const busy = await client.delete(`/api/v1/fleet/vehicles/${vehicleId}`).loginAs(owner)
    busy.assertStatus(409)
    busy.assertBodyContains({ errors: [{ code: 'E_VEHICLE_BUSY' }] })

    await client.post(`/api/v1/loads/${load.id}/withdraw`).loginAs(owner)
    const deleted = await client.delete(`/api/v1/fleet/vehicles/${vehicleId}`).loginAs(owner)
    deleted.assertStatus(204)
    assert.isNull(await Vehicle.find(vehicleId))
  })

  test("another fleet's truck is not found", async ({ client }) => {
    const { vehicleId } = await fleetWithTruck(client)
    const { owner: stranger } = await fleetWithTruck(client, 'UAA 111A')
    const response = await client.delete(`/api/v1/fleet/vehicles/${vehicleId}`).loginAs(stranger)
    response.assertStatus(404)
  })

  test('removing a driver takes them off their truck', async ({ client, assert }) => {
    const { owner, driverId, vehicleId } = await fleetWithTruck(client)
    const { load } = await dispatch(client, owner, vehicleId)

    const busy = await client.delete(`/api/v1/fleet/drivers/${driverId}`).loginAs(owner)
    busy.assertBodyContains({ errors: [{ code: 'E_DRIVER_BUSY' }] })

    await client.post(`/api/v1/loads/${load.id}/withdraw`).loginAs(owner)
    const removed = await client.delete(`/api/v1/fleet/drivers/${driverId}`).loginAs(owner)
    removed.assertStatus(204)
    assert.isNull((await DriverProfile.findByOrFail('userId', driverId)).fleetId)
    assert.isNull((await Vehicle.findOrFail(vehicleId)).assignedDriverId)

    const drivers = await client.get('/api/v1/fleet/drivers').loginAs(owner)
    assert.lengthOf(dataOf(drivers), 0)
  })

  test('a driver can leave their fleet', async ({ client, assert }) => {
    const { driverId } = await fleetWithTruck(client)
    const driver = (
      await DriverProfile.query().where('user_id', driverId).preload('user').firstOrFail()
    ).user
    const left = await client.post('/api/v1/me/fleet/leave').loginAs(driver)
    left.assertStatus(204)
    assert.isNull((await DriverProfile.findByOrFail('userId', driverId)).fleetId)

    const again = await client.post('/api/v1/me/fleet/leave').loginAs(driver)
    again.assertBodyContains({ errors: [{ code: 'E_DRIVER_NOT_IN_FLEET' }] })
  })

  test('the owner cancels an open invite', async ({ client, assert }) => {
    const { owner } = await fleetWithTruck(client)
    const independent = await makeUser('driver')
    const invited = await client
      .post('/api/v1/fleet/drivers')
      .json({ phone: independent.phone })
      .loginAs(owner)
    const inviteId = dataOf(invited).invite.id

    const cancelled = await client.post(`/api/v1/fleet/invites/${inviteId}/cancel`).loginAs(owner)
    cancelled.assertBodyContains({ data: { status: 'CANCELLED' } })
    assert.equal((await FleetInvite.findOrFail(inviteId)).status, 'CANCELLED')

    const accept = await client
      .post(`/api/v1/me/fleet-invites/${inviteId}/accept`)
      .loginAs(independent)
    accept.assertBodyContains({ errors: [{ code: 'E_INVITE_CLOSED' }] })
  })
})

test.group('Profile photos', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    drive.fake('fs')
    return () => drive.restore('fs')
  })

  const upload = (client: ApiClient, user: User) =>
    client
      .post('/api/v1/me/avatar')
      .file('file', JPEG_BYTES, { filename: 'me.jpg', contentType: 'image/jpeg' })
      .loginAs(user)

  test('uploading a photo sets the avatar path; replacing it changes the version', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const first = dataOf(await upload(client, shipper)).avatarPath
    assert.match(first, new RegExp(`^users/${shipper.id}/avatar\\?v=\\w{8}$`))

    const second = dataOf(await upload(client, shipper)).avatarPath
    assert.notEqual(first, second)

    const photo = await client.get(`/api/v1/${second}`).loginAs(shipper)
    photo.assertStatus(200)
    photo.assertHeader('content-type', 'image/jpeg')

    const removed = await client.delete('/api/v1/me/avatar').loginAs(shipper)
    assert.isNull(dataOf(removed).avatarPath)
  })

  test('the people you work with can see your photo; strangers cannot', async ({
    client,
    assert,
  }) => {
    const { owner, driverId, vehicleId } = await fleetWithTruck(client)
    const driver = (
      await DriverProfile.query().where('user_id', driverId).preload('user').firstOrFail()
    ).user
    await upload(client, driver)
    const path = `/api/v1/users/${driverId}/avatar`

    ;(await client.get(path).loginAs(owner)).assertStatus(200)
    ;(await client.get(path).loginAs(await makeUser('shipper'))).assertStatus(404)

    const { shipper, load } = await dispatch(client, owner, vehicleId)
    ;(await client.get(path).loginAs(shipper)).assertStatus(200)

    // The shipper sees it on the load once escrow is funded
    await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mtn' }).loginAs(shipper)
    const shown = await client.get(`/api/v1/loads/${load.id}`).loginAs(shipper)
    assert.match(dataOf(shown).carrier.driverAvatarPath, /^users\/\d+\/avatar\?v=/)
  })

  test('only images are accepted', async ({ client }) => {
    const shipper = await makeUser('shipper')
    const response = await client
      .post('/api/v1/me/avatar')
      .file('file', Buffer.from('%PDF-1.4'), { filename: 'me.pdf', contentType: 'application/pdf' })
      .loginAs(shipper)
    response.assertStatus(422)
  })
})
