import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Escrow from '#models/escrow'
import PaymentTransaction from '#models/payment_transaction'
import LoadEvent from '#models/load_event'
import { makeLoad, makeUser, loadInput, dataOf } from '#tests/helpers'

test.group('Loads / escrow lifecycle', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('shipper → driver → escrow → delivery → release code → payout', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')

    // Post
    const created = await client.post('/api/v1/loads').json(loadInput()).loginAs(shipper)
    created.assertStatus(201)
    const id = dataOf(created).id
    created.assertBodyContains({ data: { status: 'DRAFT', market: 'UG' } })
    assert.match(dataOf(created).reference, /^A2B-[2-9A-Z]{6}$/)

    ;(await client.post(`/api/v1/loads/${id}/publish`).loginAs(shipper)).assertBodyContains({
      data: { status: 'OPEN' },
    })

    // Driver finds it on the board and accepts
    const board = await client.get('/api/v1/loads').qs({ scope: 'board' }).loginAs(driver)
    assert.include(
      dataOf(board).map((l: any) => l.id),
      id
    )

    const accepted = await client.post(`/api/v1/loads/${id}/accept`).loginAs(driver)
    accepted.assertBodyContains({
      data: {
        status: 'MATCHED',
        driverId: driver.id,
        escrow: { status: 'AWAITING_DEPOSIT', amount: 450000, currency: 'UGX' },
      },
    })
    assert.isNull(dataOf(accepted).location, 'exact addresses stay hidden until escrow is funded')
    assert.isNull(dataOf(accepted).carrier, 'driver identity stays masked until escrow is funded')

    // MMG is Guyana-only
    const wrongRail = await client
      .post(`/api/v1/loads/${id}/deposit`)
      .json({ method: 'mmg' })
      .loginAs(shipper)
    wrongRail.assertStatus(422)
    wrongRail.assertBodyContains({ errors: [{ code: 'E_METHOD_UNAVAILABLE' }] })

    const deposit = await client
      .post(`/api/v1/loads/${id}/deposit`)
      .json({ method: 'mtn' })
      .loginAs(shipper)
    deposit.assertBodyContains({
      data: { status: 'SECURED', escrow: { status: 'HELD', depositMethod: 'mtn' } },
    })

    const shipperView = await client.get(`/api/v1/loads/${id}`).loginAs(shipper)
    shipperView.assertBodyContains({
      data: { carrier: { driverName: driver.fullName, driverPhone: driver.phone } },
    })

    const driverView = await client.get(`/api/v1/loads/${id}`).loginAs(driver)
    driverView.assertBodyContains({
      data: { location: { pickupAddress: 'Plot 12, Makindye Road, Kampala' } },
    })

    // Transit
    ;(
      await client
        .post(`/api/v1/loads/${id}/progress`)
        .json({ status: 'IN_TRANSIT' })
        .loginAs(driver)
    ).assertBodyContains({
      data: { status: 'IN_TRANSIT' },
    })
    ;(
      await client
        .post(`/api/v1/loads/${id}/progress`)
        .json({ status: 'DELIVERED' })
        .loginAs(driver)
    ).assertBodyContains({
      data: { status: 'DELIVERED' },
    })

    // Release
    const codeResponse = await client.post(`/api/v1/loads/${id}/release-code`).loginAs(shipper)
    const code: string = dataOf(codeResponse).code
    assert.match(code, /^\d{6}$/)

    const wrongCode = code === '000000' ? '111111' : '000000'
    const wrong = await client
      .post(`/api/v1/loads/${id}/release`)
      .json({ code: wrongCode })
      .loginAs(driver)
    wrong.assertStatus(422)
    wrong.assertBodyContains({ errors: [{ code: 'E_CODE_INVALID' }] })
    assert.equal(
      (await Escrow.findByOrFail('loadId', id)).releaseAttempts,
      1,
      'wrong attempt is recorded'
    )

    const released = await client.post(`/api/v1/loads/${id}/release`).json({ code }).loginAs(driver)
    released.assertBodyContains({ data: { status: 'COMPLETED', escrow: { status: 'RELEASED' } } })

    const escrow = await Escrow.findByOrFail('loadId', id)
    const kinds = (
      await PaymentTransaction.query().where('escrow_id', escrow.id).orderBy('id')
    ).map((t) => t.kind)
    assert.deepEqual(kinds, ['DEPOSIT', 'PAYOUT'])
    assert.isNull(escrow.releaseCodeHash, 'code cannot be reused')

    const history = (await LoadEvent.query().where('load_id', id).orderBy('id')).map(
      (e) => `${e.toStatus}:${e.actorRole}`
    )
    assert.deepEqual(history, [
      'DRAFT:shipper',
      'OPEN:shipper',
      'MATCHED:driver',
      'SECURED:system',
      'IN_TRANSIT:driver',
      'DELIVERED:driver',
      'COMPLETED:driver',
    ])
  })

  test('only one carrier can accept a load', async ({ client }) => {
    const shipper = await makeUser('shipper')
    const [first, second] = [await makeUser('driver'), await makeUser('driver')]
    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)

    ;(await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(first)).assertStatus(200)
    const late = await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(second)
    late.assertStatus(409)
    late.assertBodyContains({ errors: [{ code: 'E_INVALID_TRANSITION' }] })
  })

  test('carriers cannot accept loads in another market', async ({ client }) => {
    const shipper = await makeUser('shipper', 'UG')
    const guyaneseDriver = await makeUser('driver', 'GY')
    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)

    ;(await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(guyaneseDriver)).assertStatus(
      403
    )
    const board = await client.get('/api/v1/loads').qs({ scope: 'board' }).loginAs(guyaneseDriver)
    board.assertBodyContains({ data: [] })
  })

  test("strangers can't see someone else's load", async ({ client }) => {
    const owner = await makeUser('shipper')
    const other = await makeUser('shipper')
    const load = await makeLoad(owner)
    ;(await client.get(`/api/v1/loads/${load.id}`).loginAs(other)).assertStatus(404)
  })

  test('the shipper cannot report driver milestones and the driver cannot skip escrow', async ({
    client,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
    await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)

    ;(
      await client
        .post(`/api/v1/loads/${load.id}/progress`)
        .json({ status: 'IN_TRANSIT' })
        .loginAs(shipper)
    ).assertStatus(403)
    const skip = await client
      .post(`/api/v1/loads/${load.id}/progress`)
      .json({ status: 'IN_TRANSIT' })
      .loginAs(driver)
    skip.assertStatus(409)
  })

  test('a carrier withdrawing puts the load back on the board', async ({ client, assert }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
    await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)

    ;(await client.post(`/api/v1/loads/${load.id}/withdraw`).loginAs(driver)).assertStatus(200)
    const view = await client.get(`/api/v1/loads/${load.id}`).loginAs(shipper)
    view.assertBodyContains({ data: { status: 'OPEN', driverId: null, escrow: null } })
    assert.isNull(await Escrow.findBy('loadId', load.id))
  })

  test('shipper can cancel before funding, not after', async ({ client }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const open = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${open.id}/publish`).loginAs(shipper)
    ;(await client.post(`/api/v1/loads/${open.id}/cancel`).loginAs(shipper)).assertBodyContains({
      data: { status: 'CANCELLED' },
    })

    const funded = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${funded.id}/publish`).loginAs(shipper)
    await client.post(`/api/v1/loads/${funded.id}/accept`).loginAs(driver)
    await client
      .post(`/api/v1/loads/${funded.id}/deposit`)
      .json({ method: 'airtel' })
      .loginAs(shipper)
    ;(await client.post(`/api/v1/loads/${funded.id}/cancel`).loginAs(shipper)).assertStatus(409)
  })

  test('the release code only exists once cargo is moving, and expires attempts', async ({
    client,
  }) => {
    const shipper = await makeUser('shipper')
    const driver = await makeUser('driver')
    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
    await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)
    await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mtn' }).loginAs(shipper)

    ;(await client.post(`/api/v1/loads/${load.id}/release-code`).loginAs(shipper)).assertStatus(409)

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
    const wrong = code === '999999' ? '888888' : '999999'
    for (let i = 0; i < 5; i++) {
      await client.post(`/api/v1/loads/${load.id}/release`).json({ code: wrong }).loginAs(driver)
    }
    const locked = await client
      .post(`/api/v1/loads/${load.id}/release`)
      .json({ code })
      .loginAs(driver)
    locked.assertStatus(429)
  })
})
