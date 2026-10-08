import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import PaymentTransaction from '#models/payment_transaction'
import Escrow from '#models/escrow'
import User from '#models/user'
import { makeLoad, makeUser, nextPhone, dataOf } from '#tests/helpers'

test.group('Fleet', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('owner sets up a fleet, adds a driver and a truck, and dispatches a load', async ({
    client,
    assert,
  }) => {
    const owner = await makeUser('fleet_owner')
    const shipper = await makeUser('shipper')

    ;(
      await client
        .post('/api/v1/fleet')
        .json({ name: 'Apex Logistics', sizeTier: '1-5', taxId: '1000123456' })
        .loginAs(owner)
    ).assertStatus(201)

    // Driver added by phone gets an account they can later sign in to
    const driverPhone = nextPhone('UG')
    const added = await client
      .post('/api/v1/fleet/drivers')
      .json({ phone: driverPhone, fullName: 'John Mukasa' })
      .loginAs(owner)
    added.assertStatus(201)
    const driverId = dataOf(added).id
    assert.equal((await User.findOrFail(driverId)).role, 'driver')

    const truck = await client
      .post('/api/v1/fleet/vehicles')
      .json({
        plate: 'uam456k',
        make: 'Mitsubishi',
        model: 'Fuso Fighter',
        vehicleClass: 'LORRY',
        bodyType: 'DRY_BOX',
        capacityTons: 10,
        assignedDriverId: driverId,
      })
      .loginAs(owner)
    truck.assertStatus(201)
    truck.assertBodyContains({ data: { plate: 'UAM 456K' } })

    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)

    const noTruck = await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(owner)
    noTruck.assertStatus(422)

    const dispatched = await client
      .post(`/api/v1/loads/${load.id}/accept`)
      .json({ vehicleId: dataOf(truck).id })
      .loginAs(owner)
    dispatched.assertBodyContains({
      data: { status: 'MATCHED', driverId, vehicleId: dataOf(truck).id },
    })

    const fleetLoads = await client.get('/api/v1/loads').loginAs(owner)
    assert.deepEqual(
      dataOf(fleetLoads).map((l: any) => l.id),
      [load.id]
    )

    // Assigned driver completes it; payout goes to the fleet owner
    const driver = await User.findOrFail(driverId)
    await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mtn' }).loginAs(shipper)
    await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'IN_TRANSIT' })
      .loginAs(driver)
    await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'DELIVERED' })
      .loginAs(driver)
    const { code } = (
      await client.post(`/api/v1/loads/${load.id}/release-code`).loginAs(shipper)
    ).body().data
    ;(
      await client.post(`/api/v1/loads/${load.id}/release`).json({ code }).loginAs(driver)
    ).assertBodyContains({
      data: { status: 'COMPLETED' },
    })

    const escrow = await Escrow.findByOrFail('loadId', load.id)
    const payout = await PaymentTransaction.query()
      .where('escrow_id', escrow.id)
      .where('kind', 'PAYOUT')
      .firstOrFail()
    assert.equal((payout.raw as any).amount, 450000)
  })

  test('fleet tax IDs are validated against the market', async ({ client }) => {
    const owner = await makeUser('fleet_owner', 'GY')
    const response = await client
      .post('/api/v1/fleet')
      .json({ name: 'Demerara Haulage', sizeTier: '6-20', taxId: '12345' })
      .loginAs(owner)
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_INVALID_TAX_ID' }] })
  })

  test("owners can't dispatch another fleet's truck", async ({ client }) => {
    const [ownerA, ownerB] = [await makeUser('fleet_owner'), await makeUser('fleet_owner')]
    const shipper = await makeUser('shipper')
    await client
      .post('/api/v1/fleet')
      .json({ name: 'Alpha Haulage', sizeTier: '1-5' })
      .loginAs(ownerA)
    await client
      .post('/api/v1/fleet')
      .json({ name: 'Bravo Transport', sizeTier: '1-5' })
      .loginAs(ownerB)
    const truckB = await client
      .post('/api/v1/fleet/vehicles')
      .json({
        plate: 'UBH 892K',
        make: 'Isuzu',
        model: 'FRR',
        vehicleClass: 'CANTER',
        bodyType: 'REFRIGERATED',
        capacityTons: 5,
      })
      .loginAs(ownerB)

    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
    const response = await client
      .post(`/api/v1/loads/${load.id}/accept`)
      .json({ vehicleId: dataOf(truckB).id })
      .loginAs(ownerA)
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_VEHICLE_REQUIRED' }] })
  })
})
