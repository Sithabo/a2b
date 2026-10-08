import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import { makeLoad, makeUser, dataOf } from '#tests/helpers'

test.group('Loads / customs documents', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    drive.fake('fs')
    return () => drive.restore('fs')
  })

  test('an import load needs every required document before it goes on the board', async ({
    client,
    assert,
  }) => {
    const shipper = await makeUser('shipper', 'GY')
    const driver = await makeUser('driver', 'GY')
    const load = await makeLoad(shipper, {
      isImport: true,
      containerId: 'CON-GY-82195',
      cargo: { type: 'HEAVY_MACHINERY', requiresGoInvestWaiver: true },
    })

    const blocked = await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)
    blocked.assertStatus(422)
    blocked.assertBodyContains({ errors: [{ code: 'E_DOCUMENTS_MISSING' }] })

    const requirements = await client.get(`/api/v1/loads/${load.id}/requirements`).loginAs(shipper)
    const missing: string[] = dataOf(requirements).missing.map((d: any) => d.id)
    assert.sameMembers(missing, [
      'bill_of_lading',
      'commercial_invoice',
      'customs_declaration',
      'import_license',
      'go_invest_concession',
    ])

    for (const requirementId of missing) {
      const upload = await client
        .post(`/api/v1/loads/${load.id}/documents`)
        .field('requirementId', requirementId)
        .file('file', Buffer.from('%PDF-1.4 scan'), {
          filename: `${requirementId}.pdf`,
          contentType: 'application/pdf',
        })
        .loginAs(shipper)
      upload.assertStatus(201)
    }

    ;(await client.post(`/api/v1/loads/${load.id}/publish`).loginAs(shipper)).assertBodyContains({
      data: { status: 'OPEN' },
    })

    // The carrier only gets the customs pass once escrow is funded
    await client.post(`/api/v1/loads/${load.id}/accept`).loginAs(driver)
    ;(await client.get(`/api/v1/loads/${load.id}/documents`).loginAs(driver)).assertStatus(404)
    await client.post(`/api/v1/loads/${load.id}/deposit`).json({ method: 'mmg' }).loginAs(shipper)
    const docs = await client.get(`/api/v1/loads/${load.id}/documents`).loginAs(driver)
    docs.assertStatus(200)
    assert.lengthOf(dataOf(docs), 5)

    const file = await client
      .get(`/api/v1/loads/${load.id}/documents/${dataOf(docs)[0].id}`)
      .loginAs(driver)
    file.assertStatus(200)
    file.assertHeader('content-type', 'application/pdf')
  })

  test('rejects document types from another market', async ({ client }) => {
    const shipper = await makeUser('shipper', 'GY')
    const load = await makeLoad(shipper, { isImport: true })
    const upload = await client
      .post(`/api/v1/loads/${load.id}/documents`)
      .field('requirementId', 'packing_list') // Uganda-only
      .file('file', Buffer.from('%PDF-1.4'), {
        filename: 'packing.pdf',
        contentType: 'application/pdf',
      })
      .loginAs(shipper)
    upload.assertStatus(422)
  })
})
