import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import type { ApiClient } from '@japa/api-client'
import { DateTime } from 'luxon'
import DriverProfile from '#models/driver_profile'
import Escrow from '#models/escrow'
import Load from '#models/load'
import LoadEvent from '#models/load_event'
import PaymentTransaction from '#models/payment_transaction'
import type User from '#models/user'
import paymentsConfig from '#config/payments'
import { expireUnfundedLoads } from '#services/escrow_service'
import { payments } from '#services/payments/index'
import { MOCK_SIGNATURE_HEADER, signMockWebhook } from '#services/payments/mock_payment_driver'
import type { PaymentDriver } from '#services/payments/payment_driver'
import { makeLoad, makeUser, nextPhone, dataOf, deliver } from '#tests/helpers'

let plateSeq = 100

/** A fleet with one driver per truck. Drivers are added fresh (PENDING verification). */
async function makeFleet(client: ApiClient, trucks = 1) {
  const owner = await makeUser('fleet_owner')
  await client.post('/api/v1/fleet').json({ name: 'Apex', sizeTier: '1-5' }).loginAs(owner)
  const fleet = []
  for (let i = 0; i < trucks; i++) {
    const driverId = dataOf(
      await client
        .post('/api/v1/fleet/drivers')
        .json({ phone: nextPhone(), fullName: `Driver ${i}` })
        .loginAs(owner)
    ).driver.id
    const vehicleId = dataOf(
      await client
        .post('/api/v1/fleet/vehicles')
        .json({
          plate: `UBA ${plateSeq++}K`,
          make: 'Isuzu',
          model: 'FRR',
          vehicleClass: 'CANTER',
          bodyType: 'DRY_BOX',
          capacityTons: 5,
          assignedDriverId: driverId,
        })
        .loginAs(owner)
    ).id
    fleet.push({ driverId, vehicleId })
  }
  return { owner, trucks: fleet }
}

async function openLoad(client: ApiClient, shipper: User) {
  const load = await makeLoad(shipper)
  await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
  return load
}

/** Swaps one provider method for the test, restoring it after. */
async function withProvider<K extends 'collect' | 'payout' | 'refund'>(
  method: K,
  impl: PaymentDriver[K],
  run: () => Promise<void>
) {
  const original = payments[method]
  payments[method] = impl
  try {
    await run()
  } finally {
    payments[method] = original
  }
}

function webhook(client: ApiClient, body: Record<string, unknown>, signature?: string) {
  const raw = JSON.stringify(body)
  return client
    .post('/api/v1/webhooks/payments')
    .header(MOCK_SIGNATURE_HEADER, signature ?? signMockWebhook(raw, paymentsConfig.webhookSecret!))
    .json(body)
}

test.group('Dispatch', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    drive.fake('fs')
    return () => drive.restore('fs')
  })

  test('a fleet must send a truck with a driver', async ({ client }) => {
    const owner = await makeUser('fleet_owner')
    await client.post('/api/v1/fleet').json({ name: 'Apex', sizeTier: '1-5' }).loginAs(owner)
    const truck = await client
      .post('/api/v1/fleet/vehicles')
      .json({
        plate: 'UBA 100K',
        make: 'Isuzu',
        model: 'FRR',
        vehicleClass: 'CANTER',
        bodyType: 'DRY_BOX',
        capacityTons: 5,
      })
      .loginAs(owner)
    const load = await openLoad(client, await makeUser('shipper'))

    const response = await client
      .post(`/api/v1/loads/${load.id}/accept`)
      .json({ vehicleId: dataOf(truck).id })
      .loginAs(owner)
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_DRIVER_REQUIRED' }] })
  })

  test('unverified drivers only carry loads their fleet dispatches', async ({ client }) => {
    const shipper = await makeUser('shipper')
    const independent = await makeUser('driver')
    await DriverProfile.query()
      .where('user_id', independent.id)
      .update({ verification_status: 'PENDING' })
    const load = await openLoad(client, shipper)

    const self = await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(independent)
    self.assertStatus(403)
    self.assertBodyContains({ errors: [{ code: 'E_DRIVER_UNVERIFIED' }] })

    // A fleet's drivers start PENDING; the fleet may still dispatch them
    const { owner, trucks } = await makeFleet(client)
    const dispatched = await client
      .post(`/api/v1/loads/${load.id}/accept`)
      .json({ vehicleId: trucks[0].vehicleId })
      .loginAs(owner)
    dispatched.assertBodyContains({ data: { status: 'MATCHED', driverId: trucks[0].driverId } })
  })

  test('a driver works one job at a time', async ({ client }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const first = await openLoad(client, shipper)
    const second = await openLoad(client, shipper)
    ;(await client.post(`/api/v1/loads/${first.id}/accept`).loginAs(driver)).assertStatus(200)

    const busy = await client.post(`/api/v1/loads/${second.id}/accept`).loginAs(driver)
    busy.assertStatus(409)
    busy.assertBodyContains({ errors: [{ code: 'E_DRIVER_BUSY' }] })
  })

  test('the fleet can change driver and truck before pickup', async ({ client, assert }) => {
    const shipper = await makeUser('shipper')
    const { owner, trucks } = await makeFleet(client, 2)
    const [a, b] = trucks
    const load = await openLoad(client, shipper)
    await client
      .post(`/api/v1/loads/${load.id}/accept`)
      .json({ vehicleId: a.vehicleId })
      .loginAs(owner)

    const reassigned = await client
      .post(`/api/v1/loads/${load.id}/assign`)
      .json({ vehicleId: b.vehicleId })
      .loginAs(owner)
    reassigned.assertBodyContains({
      data: { status: 'MATCHED', driverId: b.driverId, vehicleId: b.vehicleId },
    })
    const event = await LoadEvent.query()
      .where('load_id', load.id)
      .orderBy('id', 'desc')
      .firstOrFail()
    assert.include(event.note!, 'Assigned to Driver 1')

    // The new driver sees the job; the old one no longer does
    const { default: User } = await import('#models/user')
    const newDriver = await User.findOrFail(b.driverId)
    const oldDriver = await User.findOrFail(a.driverId)
    ;(await client.get(`/api/v1/loads/${load.id}`).loginAs(newDriver)).assertStatus(200)
    ;(await client.get(`/api/v1/loads/${load.id}`).loginAs(oldDriver)).assertStatus(404)

    // Not once the cargo is moving
    await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mtn' }).loginAs(shipper)
    await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'IN_TRANSIT' })
      .loginAs(newDriver)
    const late = await client
      .post(`/api/v1/loads/${load.id}/assign`)
      .json({ vehicleId: a.vehicleId })
      .loginAs(owner)
    late.assertStatus(409)
  })

  test("only the load's fleet can reassign it", async ({ client }) => {
    const shipper = await makeUser('shipper')
    const ours = await makeFleet(client)
    const theirs = await makeFleet(client)
    const load = await openLoad(client, shipper)
    await client
      .post(`/api/v1/loads/${load.id}/accept`)
      .json({ vehicleId: ours.trucks[0].vehicleId })
      .loginAs(ours.owner)

    const response = await client
      .post(`/api/v1/loads/${load.id}/assign`)
      .json({ vehicleId: theirs.trucks[0].vehicleId })
      .loginAs(theirs.owner)
    response.assertStatus(403)
  })
})

test.group('Escrow lifecycle', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    drive.fake('fs')
    return () => drive.restore('fs')
  })

  test('unfunded matches go back on the board when the window lapses', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const stale = await openLoad(client, shipper)
    const fresh = await openLoad(client, shipper)
    const other = await makeUser('driver')
    await client.post(`/api/v1/loads/${stale.id}/accept`).loginAs(driver)
    await client.post(`/api/v1/loads/${fresh.id}/accept`).loginAs(other)
    await Escrow.query()
      .where('load_id', stale.id)
      .update({ funding_due_at: DateTime.now().minus({ minutes: 1 }).toSQL() })

    assert.equal(await expireUnfundedLoads(), 1)
    assert.equal(await expireUnfundedLoads(), 0) // idempotent

    const expired = await Load.findOrFail(stale.id)
    assert.equal(expired.status, 'OPEN')
    assert.isNull(expired.driverId)
    assert.equal((await Escrow.findByOrFail('loadId', stale.id)).status, 'VOID')
    assert.equal((await Load.findOrFail(fresh.id)).status, 'MATCHED')

    // The freed driver can take work again
    const again = await openLoad(client, shipper)
    ;(await client.post(`/api/v1/loads/${again.id}/accept`).loginAs(driver)).assertStatus(200)
  })

  test('a deposit the provider confirms later secures the load by webhook', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const load = await openLoad(client, shipper)
    await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)

    await withProvider(
      'collect',
      async () => ({ status: 'PENDING', providerRef: 'MOMO-123' }),
      async () => {
        const deposit = await client
          .post(`/api/v1/loads/${load.id}/deposit`)
          .json({ method: 'mtn' })
          .loginAs(shipper)
        deposit.assertBodyContains({ data: { status: 'MATCHED' } })
      }
    )

    // While the shipper's money may be in flight, nothing can undo the match
    const withdraw = await client.post(`/api/v1/loads/${load.id}/withdraw`).loginAs(driver)
    withdraw.assertBodyContains({ errors: [{ code: 'E_PAYMENT_PENDING' }] })
    await Escrow.query()
      .where('load_id', load.id)
      .update({ funding_due_at: DateTime.now().minus({ minutes: 1 }).toSQL() })
    assert.equal(await expireUnfundedLoads(), 0)

    // Forged and genuine notifications
    const forged = await webhook(
      client,
      { id: 'evt-1', providerRef: 'MOMO-123', status: 'SUCCEEDED' },
      'bad'
    )
    forged.assertStatus(401)
    const confirmed = await webhook(client, {
      id: 'evt-1',
      providerRef: 'MOMO-123',
      status: 'SUCCEEDED',
    })
    confirmed.assertStatus(200)
    assert.equal((await Load.findOrFail(load.id)).status, 'SECURED')
    assert.equal((await Escrow.findByOrFail('loadId', load.id)).status, 'HELD')

    // Providers retry: the same event is applied once
    const replay = await webhook(client, {
      id: 'evt-1',
      providerRef: 'MOMO-123',
      status: 'SUCCEEDED',
    })
    replay.assertBodyContains({ duplicate: true })
    const events = await LoadEvent.query().where('load_id', load.id).where('to_status', 'SECURED')
    assert.lengthOf(events, 1)
  })

  test('a declined deposit can be retried, and the carrier can still withdraw', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const load = await openLoad(client, shipper)
    await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)

    await withProvider(
      'collect',
      async () => ({ status: 'FAILED', providerRef: 'MOMO-DECLINED' }),
      async () => {
        const declined = await client
          .post(`/api/v1/loads/${load.id}/deposit`)
          .json({ method: 'mtn' })
          .loginAs(shipper)
        declined.assertBodyContains({ errors: [{ code: 'E_PAYMENT_FAILED' }] })
      }
    )
    const retry = await client
      .post(`/api/v1/loads/${load.id}/deposit`)
      .json({ method: 'airtel' })
      .loginAs(shipper)
    retry.assertBodyContains({ data: { status: 'SECURED' } })

    const attempts = await PaymentTransaction.query().where('kind', 'DEPOSIT').orderBy('id')
    assert.deepEqual(
      attempts.map((t) => t.status),
      ['FAILED', 'SUCCEEDED']
    )
    assert.notEqual(attempts[0].reference, attempts[1].reference)

    // Withdrawing after a declined attempt used to fail on the payment history
    const other = await openLoad(client, shipper)
    const second = await makeUser('driver')
    await client.post(`/api/v1/loads/${other.id}/accept`).loginAs(second)
    await withProvider(
      'collect',
      async () => ({ status: 'FAILED', providerRef: 'MOMO-DECLINED-2' }),
      async () => {
        await client
          .post(`/api/v1/loads/${other.id}/deposit`)
          .json({ method: 'mtn' })
          .loginAs(shipper)
      }
    )
    ;(await client.post(`/api/v1/loads/${other.id}/withdraw`).loginAs(second)).assertStatus(200)
  })

  test('a payout the provider confirms later completes the job by webhook', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const load = await openLoad(client, shipper)
    await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)
    await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mtn' }).loginAs(shipper)
    await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'IN_TRANSIT' })
      .loginAs(driver)
    await deliver(client, load.id, driver)
    const { code } = dataOf(
      await client.post(`/api/v1/loads/${load.id}/release-code`).loginAs(shipper)
    )

    await withProvider(
      'payout',
      async () => ({ status: 'PENDING', providerRef: 'PAYOUT-9' }),
      async () => {
        const release = await client
          .post(`/api/v1/loads/${load.id}/release`)
          .json({ code })
          .loginAs(driver)
        release.assertBodyContains({ errors: [{ code: 'E_PAYMENT_PENDING' }] })
      }
    )
    assert.equal((await Load.findOrFail(load.id)).status, 'DELIVERED')

    await webhook(client, { id: 'evt-payout', providerRef: 'PAYOUT-9', status: 'SUCCEEDED' })
    assert.equal((await Load.findOrFail(load.id)).status, 'COMPLETED')
    assert.equal((await Escrow.findByOrFail('loadId', load.id)).status, 'RELEASED')
    const profile = await DriverProfile.findByOrFail('userId', driver.id)
    assert.equal(profile.completedTrips, 1)
  })
})
