import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import DriverProfile from '#models/driver_profile'
import type User from '#models/user'
import { makeLoad, makeUser, dataOf } from '#tests/helpers'
import type { ApiClient } from '@japa/api-client'

async function makeFleetOwner(client: ApiClient, name = 'Apex Logistics') {
  const owner = await makeUser('fleet_owner')
  ;(await client.post('/api/v1/fleet').json({ name, sizeTier: '1-5' }).loginAs(owner)).assertStatus(
    201
  )
  return owner
}

const fleetIdOf = async (driver: User) =>
  (await DriverProfile.findByOrFail('userId', driver.id)).fleetId

test.group('Fleet invites', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a driver who already uses A2B is invited, not added', async ({ client, assert }) => {
    const owner = await makeFleetOwner(client)
    const driver = await makeUser('driver') // independent, has signed in

    const added = await client
      .post('/api/v1/fleet/drivers')
      .json({ phone: driver.phone })
      .loginAs(owner)
    added.assertStatus(202)
    added.assertBodyContains({
      data: {
        status: 'INVITED',
        driver: null,
        invite: { status: 'PENDING', fleetName: 'Apex Logistics' },
      },
    })
    assert.isNull(await fleetIdOf(driver))

    const fleetDrivers = await client.get('/api/v1/fleet/drivers').loginAs(owner)
    assert.lengthOf(dataOf(fleetDrivers), 0)
    const pending = await client.get('/api/v1/fleet/invites').loginAs(owner)
    assert.lengthOf(dataOf(pending), 1)

    // Adding them again doesn't create (or text) a second invite
    const again = await client
      .post('/api/v1/fleet/drivers')
      .json({ phone: driver.phone })
      .loginAs(owner)
    assert.equal(dataOf(again).invite.id, dataOf(added).invite.id)
  })

  test('accepting joins the fleet and cancels other invites', async ({ client, assert }) => {
    const ownerA = await makeFleetOwner(client, 'Alpha Haulage')
    const ownerB = await makeFleetOwner(client, 'Bravo Transport')
    const driver = await makeUser('driver')
    await client.post('/api/v1/fleet/drivers').json({ phone: driver.phone }).loginAs(ownerA)
    await client.post('/api/v1/fleet/drivers').json({ phone: driver.phone }).loginAs(ownerB)

    const invites = dataOf(await client.get('/api/v1/me/fleet-invites').loginAs(driver))
    assert.lengthOf(invites, 2)
    const fromA = invites.find((i: any) => i.fleetName === 'Alpha Haulage')

    const accepted = await client
      .post(`/api/v1/me/fleet-invites/${fromA.id}/accept`)
      .loginAs(driver)
    accepted.assertStatus(200)
    accepted.assertBodyContains({ data: { status: 'ACCEPTED' } })
    assert.equal(await fleetIdOf(driver), fromA.fleetId)

    assert.lengthOf(dataOf(await client.get('/api/v1/me/fleet-invites').loginAs(driver)), 0)
    assert.lengthOf(dataOf(await client.get('/api/v1/fleet/drivers').loginAs(ownerA)), 1)
    assert.lengthOf(dataOf(await client.get('/api/v1/fleet/invites').loginAs(ownerB)), 0)
  })

  test('declining leaves the driver independent', async ({ client, assert }) => {
    const owner = await makeFleetOwner(client)
    const driver = await makeUser('driver')
    const invite = dataOf(
      await client.post('/api/v1/fleet/drivers').json({ phone: driver.phone }).loginAs(owner)
    ).invite

    const declined = await client
      .post(`/api/v1/me/fleet-invites/${invite.id}/decline`)
      .loginAs(driver)
    declined.assertBodyContains({ data: { status: 'DECLINED' } })
    assert.isNull(await fleetIdOf(driver))

    const again = await client.post(`/api/v1/me/fleet-invites/${invite.id}/accept`).loginAs(driver)
    again.assertStatus(409)
    again.assertBodyContains({ errors: [{ code: 'E_INVITE_CLOSED' }] })
  })

  test("a driver can't join a fleet in the middle of a job", async ({ client }) => {
    const owner = await makeFleetOwner(client)
    const driver = await makeUser('driver')
    const shipper = await makeUser('shipper')
    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
    ;(await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)).assertStatus(200)

    const invite = dataOf(
      await client.post('/api/v1/fleet/drivers').json({ phone: driver.phone }).loginAs(owner)
    ).invite
    const response = await client
      .post(`/api/v1/me/fleet-invites/${invite.id}/accept`)
      .loginAs(driver)
    response.assertStatus(409)
    response.assertBodyContains({ errors: [{ code: 'E_DRIVER_BUSY' }] })
  })

  test('only the invited driver can answer an invite', async ({ client }) => {
    const owner = await makeFleetOwner(client)
    const driver = await makeUser('driver')
    const someoneElse = await makeUser('driver')
    const invite = dataOf(
      await client.post('/api/v1/fleet/drivers').json({ phone: driver.phone }).loginAs(owner)
    ).invite

    const response = await client
      .post(`/api/v1/me/fleet-invites/${invite.id}/accept`)
      .loginAs(someoneElse)
    response.assertStatus(404)
  })
})
