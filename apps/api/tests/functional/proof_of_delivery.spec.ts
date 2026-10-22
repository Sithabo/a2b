import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import type { ApiClient } from '@japa/api-client'
import { loadTimeline } from '@a2b/core'
import LoadEvent from '#models/load_event'
import type User from '#models/user'
import { makeLoad, makeUser, dataOf, deliver } from '#tests/helpers'

/** A load that's on the road with `driver`. */
async function inTransit(client: ApiClient, shipper: User, driver: User) {
  const load = await makeLoad(shipper)
  await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
  await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)
  await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mtn' }).loginAs(shipper)
  await client
    .post(`/api/v1/loads/${load.id}/progress`)
    .json({ status: 'IN_TRANSIT' })
    .loginAs(driver)
  return load
}

test.group('Proof of delivery', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    drive.fake('fs')
    return () => drive.restore('fs')
  })

  test('arrival needs proof of delivery', async ({ client }) => {
    const [shipper, driver] = [await makeUser('shipper'), await makeUser('driver')]
    const load = await inTransit(client, shipper, driver)

    const bare = await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'DELIVERED' })
      .loginAs(driver)
    bare.assertStatus(422)
    bare.assertBodyContains({ errors: [{ code: 'E_POD_REQUIRED' }] })

    const noPhoto = await client
      .post(`/api/v1/loads/${load.id}/deliver`)
      .field('receiverName', 'Peter Okello')
      .loginAs(driver)
    noPhoto.assertStatus(422)

    const delivered = await deliver(client, load.id, driver, 'Peter Okello')
    delivered.assertBodyContains({
      data: { status: 'DELIVERED', delivery: { receiverName: 'Peter Okello' } },
    })
  })

  test("only the load's driver can deliver it, and only once it's moving", async ({ client }) => {
    const [shipper, driver] = [await makeUser('shipper'), await makeUser('driver')]
    const secured = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${secured.id}/publish`).loginAs(shipper)
    await client.post(`/api/v1/loads/${secured.id}/accept`).loginAs(driver)
    await client
      .post(`/api/v1/loads/${secured.id}/deposit`)
      .json({ method: 'mtn' })
      .loginAs(shipper)
    ;(await deliver(client, secured.id, driver)).assertStatus(409) // not picked up yet

    await client
      .post(`/api/v1/loads/${secured.id}/progress`)
      .json({ status: 'IN_TRANSIT' })
      .loginAs(driver)
    ;(await deliver(client, secured.id, shipper)).assertStatus(403)
    ;(await deliver(client, secured.id, await makeUser('driver'))).assertStatus(403)
  })

  test('the shipper and fleet see the proof; nobody else can', async ({ client, assert }) => {
    const shipper = await makeUser('shipper')
    const owner = await makeUser('fleet_owner')
    await client.post('/api/v1/fleet').json({ name: 'Apex', sizeTier: '1-5' }).loginAs(owner)
    const driverId = dataOf(
      await client
        .post('/api/v1/fleet/drivers')
        .json({ phone: '+256772888001', fullName: 'John' })
        .loginAs(owner)
    ).driver.id
    const truck = dataOf(
      await client
        .post('/api/v1/fleet/vehicles')
        .json({
          plate: 'UBP 501K',
          make: 'Isuzu',
          model: 'FRR',
          vehicleClass: 'CANTER',
          bodyType: 'DRY_BOX',
          capacityTons: 5,
          assignedDriverId: driverId,
        })
        .loginAs(owner)
    )
    const { default: User } = await import('#models/user')
    const driver = await User.findOrFail(driverId)

    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
    await client
      .post(`/api/v1/loads/${load.id}/accept`)
      .json({ vehicleId: truck.id })
      .loginAs(owner)
    await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mtn' }).loginAs(shipper)
    await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'IN_TRANSIT' })
      .loginAs(driver)

    const before = await client.get(`/api/v1/loads/${load.id}`).loginAs(shipper)
    before.assertBodyContains({ data: { delivery: null } })
    ;(await client.get(`/api/v1/loads/${load.id}/delivery-photo`).loginAs(shipper)).assertStatus(
      404
    )

    await deliver(client, load.id, driver, 'Mary at the gate')
    const photo = `/api/v1/loads/${load.id}/delivery-photo`
    ;(await client.get(photo).loginAs(shipper)).assertStatus(200)
    ;(await client.get(photo).loginAs(owner)).assertStatus(200)
    ;(await client.get(photo).loginAs(driver)).assertStatus(200)
    ;(await client.get(photo).loginAs(await makeUser('shipper'))).assertStatus(404)

    const event = await LoadEvent.query()
      .where('load_id', load.id)
      .where('to_status', 'DELIVERED')
      .firstOrFail()
    assert.equal(event.note, 'Received by Mary at the gate')

    // The shipper's tracking timeline is built from these real events
    const view = dataOf(await client.get(`/api/v1/loads/${load.id}`).loginAs(shipper))
    const events = dataOf(await client.get(`/api/v1/loads/${load.id}/events`).loginAs(shipper))
    const steps = loadTimeline(view, events)
    assert.deepEqual(
      steps.map((s) => s.state),
      ['done', 'done', 'done', 'done', 'done', 'active']
    )
    assert.deepEqual(steps[4].notes, ['Received by Mary at the gate'])
    assert.match(steps[2].notes[0], /Escrow funded via MTN Mobile Money/)

    // The fleet and its driver read the same history, worded for them
    const history = `/api/v1/loads/${load.id}/events`
    const forDriver = loadTimeline(view, dataOf(await client.get(history).loginAs(driver)), 'driver')
    assert.deepEqual(forDriver[5].notes, ["Enter the shipper's release code"])
    const forFleet = loadTimeline(view, dataOf(await client.get(history).loginAs(owner)), 'fleet')
    assert.deepEqual(forFleet[5].notes, ["Waiting for the shipper's release code"])
    ;(await client.get(history).loginAs(await makeUser('fleet_owner'))).assertStatus(404)
  })
})
