import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import type { ApiClient } from '@japa/api-client'
import { DateTime } from 'luxon'
import { getMarket } from '@a2b/core'
import DriverProfile from '#models/driver_profile'
import DriverReview from '#models/driver_review'
import User from '#models/user'
import { makeLoad, makeUser, nextPhone, dataOf } from '#tests/helpers'

/** Enough of a JPEG header for the server to detect the type from the bytes. */
const JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
])

const UG_DOCUMENTS = getMarket('UG').driverDocuments.map((d) => d.id)

/** A driver who has signed up and entered their licence, but uploaded nothing (PENDING). */
async function newDriver() {
  const driver = await makeUser('driver')
  await DriverProfile.query()
    .where('user_id', driver.id)
    .update({ verification_status: 'PENDING', license_number: 'UG-1234567' })
  return driver
}

async function makeAdmin() {
  return User.create({
    phone: nextPhone(),
    market: 'UG',
    role: 'admin',
    phoneVerifiedAt: DateTime.now(),
  })
}

function upload(client: ApiClient, driver: User, requirementId: string) {
  return client
    .post('/api/v1/me/driver-documents')
    .field('requirementId', requirementId)
    .file('file', JPEG_BYTES, {
      filename: `${requirementId}.jpg`,
      contentType: 'image/jpeg',
    })
    .loginAs(driver)
}

async function uploadAll(client: ApiClient, driver: User) {
  for (const id of UG_DOCUMENTS) (await upload(client, driver, id)).assertStatus(201)
}

const statusOf = async (driver: User) =>
  (await DriverProfile.findByOrFail('userId', driver.id)).verificationStatus

test.group('Driver verification', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    drive.fake('fs')
    return () => drive.restore('fs')
  })

  test('a driver joins the review queue once every document is in', async ({ client, assert }) => {
    const driver = await newDriver()
    const admin = await makeAdmin()

    const uploaded = await client.get('/api/v1/me/driver-documents').loginAs(driver)
    assert.lengthOf(dataOf(uploaded), 0)

    for (const id of UG_DOCUMENTS.slice(0, -1)) await upload(client, driver, id)
    assert.isNull((await DriverProfile.findByOrFail('userId', driver.id)).submittedAt)
    assert.lengthOf(dataOf(await client.get('/api/v1/admin/drivers').loginAs(admin)), 0)

    await upload(client, driver, UG_DOCUMENTS.at(-1)!)
    const queue = dataOf(await client.get('/api/v1/admin/drivers').loginAs(admin))
    assert.deepEqual(
      queue.map((d: any) => d.id),
      [driver.id]
    )
  })

  test('unknown documents are refused', async ({ client }) => {
    const response = await upload(client, await newDriver(), 'bank_statement')
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ code: 'E_UNKNOWN_DOCUMENT' }] })
  })

  test('only staff can see the queue and review', async ({ client }) => {
    const driver = await newDriver()
    const fleetOwner = await makeUser('fleet_owner')
    ;(await client.get('/api/v1/admin/drivers').loginAs(driver)).assertStatus(403)
    ;(await client.get('/api/v1/admin/drivers').loginAs(fleetOwner)).assertStatus(403)
    ;(
      await client
        .post(`/api/v1/admin/drivers/${driver.id}/review`)
        .json({ decision: 'VERIFIED' })
        .loginAs(driver)
    ).assertStatus(403)
  })

  test('verifying lets the driver accept loads on their own', async ({ client, assert }) => {
    const driver = await newDriver()
    const admin = await makeAdmin()
    const shipper = await makeUser('shipper')
    const load = await makeLoad(shipper)
    await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)

    ;(await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)).assertStatus(403)

    // Can't verify an incomplete submission
    const early = await client
      .post(`/api/v1/admin/drivers/${driver.id}/review`)
      .json({ decision: 'VERIFIED' })
      .loginAs(admin)
    early.assertBodyContains({ errors: [{ code: 'E_DOCUMENTS_MISSING' }] })

    await uploadAll(client, driver)
    const detail = dataOf(await client.get(`/api/v1/admin/drivers/${driver.id}`).loginAs(admin))
    assert.lengthOf(detail.documents, UG_DOCUMENTS.length)
    ;(
      await client
        .get(`/api/v1/admin/drivers/${driver.id}/documents/${detail.documents[0].id}`)
        .loginAs(admin)
    ).assertStatus(200)

    const verified = await client
      .post(`/api/v1/admin/drivers/${driver.id}/review`)
      .json({ decision: 'VERIFIED' })
      .loginAs(admin)
    verified.assertBodyContains({ data: { verificationStatus: 'VERIFIED' } })
    const review = await DriverReview.findByOrFail('driverId', driver.id)
    assert.equal(review.reviewerId, admin.id)

    ;(await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)).assertStatus(200)
  })

  test('a rejection explains what to fix, and new uploads resubmit', async ({ client, assert }) => {
    const driver = await newDriver()
    const admin = await makeAdmin()
    await uploadAll(client, driver)

    const noNote = await client
      .post(`/api/v1/admin/drivers/${driver.id}/review`)
      .json({ decision: 'REJECTED' })
      .loginAs(admin)
    noNote.assertStatus(422)

    await client
      .post(`/api/v1/admin/drivers/${driver.id}/review`)
      .json({ decision: 'REJECTED', note: 'The licence photo is blurry' })
      .loginAs(admin)
    const me = dataOf(await client.get('/api/v1/me').loginAs(driver))
    assert.equal(me.driverProfile.verificationStatus, 'REJECTED')
    assert.equal(me.driverProfile.reviewNote, 'The licence photo is blurry')
    assert.lengthOf(dataOf(await client.get('/api/v1/admin/drivers').loginAs(admin)), 0)

    await upload(client, driver, 'licence_front')
    assert.equal(await statusOf(driver), 'PENDING')
    assert.lengthOf(dataOf(await client.get('/api/v1/admin/drivers').loginAs(admin)), 1)
  })

  test('changing what was verified sends the driver back for review', async ({
    client,
    assert,
  }) => {
    const driver = await newDriver()
    const admin = await makeAdmin()
    await uploadAll(client, driver)
    const verify = () =>
      client
        .post(`/api/v1/admin/drivers/${driver.id}/review`)
        .json({ decision: 'VERIFIED' })
        .loginAs(admin)

    await verify()
    await upload(client, driver, 'national_id')
    assert.equal(await statusOf(driver), 'PENDING')

    await verify()
    await client
      .put('/api/v1/me/driver-profile')
      .json({ licenseNumber: 'UG-7654321' })
      .loginAs(driver)
    assert.equal(await statusOf(driver), 'PENDING')

    // Going on duty isn't a licence change
    await verify()
    await client.put('/api/v1/me/driver-profile').json({ dutyStatus: 'AVAILABLE' }).loginAs(driver)
    assert.equal(await statusOf(driver), 'VERIFIED')
  })

  test("drivers can't open each other's documents", async ({ client }) => {
    const driver = await newDriver()
    const other = await newDriver()
    const doc = dataOf(await upload(client, driver, 'licence_front'))
    ;(await client.get(`/api/v1/me/driver-documents/${doc.id}`).loginAs(driver)).assertStatus(200)
    ;(await client.get(`/api/v1/me/driver-documents/${doc.id}`).loginAs(other)).assertStatus(404)
  })
})
