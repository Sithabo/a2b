/**
 * End-to-end smoke test of the client against a running dev API (`npm run api`).
 * Signs in as the OTP test shipper, posts a load and drives it to COMPLETED using
 * `node ace carrier:simulate` for the driver side. Writes to the a2b_dev database.
 *
 *   cd packages/api-client && npx tsx scripts/smoke.ts
 */

import { execSync } from 'node:child_process'
import { apiErrorCode, apiErrorMessage, createApiClient } from '../src/index.ts'

let token: string | null = null
let unauthorized = 0
const api = createApiClient({ baseUrl: 'http://localhost:3333', getToken: () => token, onUnauthorized: () => unauthorized++ })
const sim = (args: string) =>
  execSync(`node ace carrier:simulate ${args}`, { cwd: '../../apps/api', encoding: 'utf8' }).trim().split('\n').pop()

const phone = '+256700000001'
await api.api.auth.requestOtp({ body: { phone } })
try {
  await api.api.auth.verifyOtp({ body: { phone, code: '000000', role: 'shipper' } })
} catch (e) {
  console.log('wrong code →', apiErrorCode(e), '|', apiErrorMessage(e))
}
const auth = await api.api.auth.verifyOtp({ body: { phone, code: '123456', role: 'shipper' } })
token = auth.data.token
console.log('signed in:', auth.data.user.role, auth.data.user.market, 'new:', auth.data.isNewUser)

await api.api.me.upsertShipperProfile({ body: { companyName: 'Acme Logistics', isImporter: false } })
const created = await api.api.loads.store({
  body: {
    pickupSummary: 'Makindye, Kampala',
    dropoffSummary: 'Industrial Area, Jinja',
    pickup: { address: 'Plot 12, Makindye Road' },
    dropoff: { address: 'Plot 4, Main Street, Jinja' },
    isImport: false,
    cargo: { type: 'GENERAL_CARGO' },
    offerPrice: 450000,
  },
})
const id = created.data.id
const ref = created.data.reference
await api.api.loads.publish({ params: { id } })
console.log('posted', ref, '→', (await api.api.loads.show({ params: { id } })).data.status)

console.log('sim:', sim(`${ref} accept`))
const matched = (await api.api.loads.show({ params: { id } })).data
console.log('shipper sees', matched.status, matched.escrow?.status, matched.escrow?.amount, matched.escrow?.currency)

await api.api.escrow.deposit({ params: { id }, body: { method: 'mtn' } })
console.log('sim:', sim(`${ref} loaded`))
console.log('sim:', sim(`${ref} arrived`))
const { data: rc } = await api.api.escrow.releaseCode({ params: { id } })
console.log('release code issued, expires', rc.expiresAt)
console.log('sim:', sim(`${ref} release ${rc.code}`))

const list = await api.api.loads.index({ query: { scope: 'mine' } })
console.log('my loads:', list.data.map((l) => `${l.reference}:${l.status}`).join(', '))
const events = await api.api.loads.events({ params: { id } })
console.log('timeline:', events.data.map((e) => e.toStatus).join(' → '))

token = 'bogus'
try { await api.api.me.show({}) } catch (e) { console.log('bad token →', apiErrorMessage(e), '| onUnauthorized calls:', unauthorized) }
