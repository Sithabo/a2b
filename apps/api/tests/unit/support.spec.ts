import { test } from '@japa/runner'
import { SUPPORT_EMAIL, supportEmailUrl } from '@a2b/core'

test.group('Support email', () => {
  test('addresses support with the subject and body encoded', ({ assert }) => {
    assert.equal(SUPPORT_EMAIL, 'kalekyezikid@gmail.com')
    const url = supportEmailUrl({
      subject: 'Help & a question',
      body: 'Line one\nAccount: +256 772',
    })
    assert.equal(
      url,
      'mailto:kalekyezikid@gmail.com?subject=Help%20%26%20a%20question&body=Line%20one%0AAccount%3A%20%2B256%20772'
    )
    assert.equal(supportEmailUrl({ subject: 'Hi' }), 'mailto:kalekyezikid@gmail.com?subject=Hi')
  })
})
