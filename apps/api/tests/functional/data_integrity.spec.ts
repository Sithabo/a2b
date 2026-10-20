import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import Escrow from '#models/escrow'
import Vehicle from '#models/vehicle'
import { MAX_OFFER_PRICE } from '#validators/load'
import { dataOf, loadInput, makeUser } from '#tests/helpers'

test.group('Data integrity', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('every foreign key has an index', async ({ assert }) => {
    // A foreign key with no index on its column makes joins and deletes scan the table
    const { rows } = await db.rawQuery(`
      SELECT c.conrelid::regclass::text AS "table", a.attname AS "column"
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
      WHERE c.contype = 'f'
        AND NOT EXISTS (
          SELECT 1 FROM pg_index i WHERE i.indrelid = c.conrelid AND i.indkey[0] = c.conkey[1]
        )
    `)
    assert.deepEqual(rows, [])
  })

  test('large UGX amounts are stored and returned as numbers', async ({ client, assert }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const offerPrice = 5_000_000_000 // past the 32-bit integer limit

    const created = await client
      .post('/api/v1/loads')
      .json(loadInput({ offerPrice }))
      .loginAs(shipper)
    created.assertStatus(201)
    const loadId = dataOf(created).id
    assert.strictEqual(dataOf(created).offerPrice, offerPrice)

    await client.post(`/api/v1/loads/${loadId}/publish`).loginAs(shipper)
    await client.post(`/api/v1/loads/${loadId}/accept`).loginAs(driver)
    const escrow = await Escrow.findByOrFail('loadId', loadId)
    assert.strictEqual(escrow.amount, offerPrice)
  })

  test('offer prices above the cap are rejected', async ({ client }) => {
    const shipper = await makeUser('shipper')
    const response = await client
      .post('/api/v1/loads')
      .json(loadInput({ offerPrice: MAX_OFFER_PRICE + 1 }))
      .loginAs(shipper)
    response.assertStatus(422)
  })

  test('emails are unique regardless of case', async ({ client, assert }) => {
    const [ann, bob] = [await makeUser('shipper'), await makeUser('shipper')]
    const saved = await client.patch('/api/v1/me').json({ email: 'Ann@Example.com' }).loginAs(ann)
    saved.assertStatus(200)
    assert.equal(dataOf(saved).email, 'ann@example.com')

    const taken = await client.patch('/api/v1/me').json({ email: 'ANN@example.com' }).loginAs(bob)
    taken.assertStatus(409)
    taken.assertBodyContains({ errors: [{ code: 'E_EMAIL_TAKEN' }] })
  })

  test('a driver is assigned to one truck at a time', async ({ client, assert }) => {
    const owner = await makeUser('fleet_owner')
    await client.post('/api/v1/fleet').json({ name: 'Apex', sizeTier: '1-5' }).loginAs(owner)
    const added = await client
      .post('/api/v1/fleet/drivers')
      .json({ phone: '+256772999001', fullName: 'John' })
      .loginAs(owner)
    const driverId = dataOf(added).driver.id
    const truck = (plate: string, assignedDriverId: number | null = null) =>
      client
        .post('/api/v1/fleet/vehicles')
        .json({
          plate,
          make: 'Isuzu',
          model: 'FRR',
          vehicleClass: 'CANTER',
          bodyType: 'DRY_BOX',
          capacityTons: 5,
          assignedDriverId,
        })
        .loginAs(owner)

    const first = await truck('UAA 111A', driverId)
    first.assertStatus(201)

    // Assigning them to a new truck takes them off the first one
    const second = await truck('UAA 222B', driverId)
    second.assertStatus(201)
    assert.isNull((await Vehicle.findOrFail(dataOf(first).id)).assignedDriverId)

    // ...and the same when reassigning an existing truck
    const moved = await client
      .patch(`/api/v1/fleet/vehicles/${dataOf(first).id}`)
      .json({ assignedDriverId: driverId })
      .loginAs(owner)
    moved.assertStatus(200)
    assert.isNull((await Vehicle.findOrFail(dataOf(second).id)).assignedDriverId)

    // Re-saving a truck with its own driver keeps the assignment
    const same = await client
      .patch(`/api/v1/fleet/vehicles/${dataOf(first).id}`)
      .json({ assignedDriverId: driverId })
      .loginAs(owner)
    same.assertBodyContains({ data: { assignedDriverId: driverId } })

    // A truck can be left without a driver
    const cleared = await client
      .patch(`/api/v1/fleet/vehicles/${dataOf(first).id}`)
      .json({ assignedDriverId: null })
      .loginAs(owner)
    cleared.assertBodyContains({ data: { assignedDriverId: null } })
  })
})
