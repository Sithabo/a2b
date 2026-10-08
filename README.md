# A2B

npm-workspaces monorepo for the A2B freight apps.

```
apps/
  shipper/     Expo app — shippers post loads and track them
  fleet/       Expo app — fleet owners manage trucks and drivers, and dispatch loads
  driver/      Expo app — drivers take loads, hold for escrow, deliver and enter release codes
  api/         AdonisJS API + PostgreSQL — auth, loads, escrow, fleets, documents
packages/
  core/        Domain types, status machine, pricing, market config (GY + UG)
  ui/          Design tokens and shared components
  api-client/  Typed API client (Tuyau) generated from apps/api's routes
  features/    Shared app building blocks: session/API wiring, phone + OTP sign-in screens
backend/       Original SQL schema sketch (superseded by apps/api/database/migrations)
design/        Design references (Stitch exports)
docs/          Product and regulatory documents
```

`@a2b/core` is shared by the apps and the API. Metro reads its TypeScript source directly (`react-native` export condition); Node reads the compiled `dist/`, which the API's `dev`, `test` and `typecheck` scripts rebuild automatically. Inside packages, relative imports use explicit `.ts` extensions so both work.

## Commands

```bash
npm install            # once, from the repo root
npm run shipper        # start the shipper app
npm run fleet          # start the fleet app
npm run driver         # start the driver app
npm run api            # start the API (http://localhost:3333)
npm run test:api       # API test suite (uses the a2b_test database)
npm run typecheck      # tsc across all workspaces
```

Native dependencies (reanimated, svg, gesture-handler, …) must be installed in each app that uses them; shared packages list them as `peerDependencies`. Keep Expo/React/React Native versions identical across apps (`npx expo install --check`).

## API setup

Needs PostgreSQL 16 (e.g. `brew install postgresql@16 && brew services start postgresql@16`).

```bash
createdb a2b_dev
createdb a2b_test
cp apps/api/.env.example apps/api/.env      # then set DB_USER to your Postgres user
cd apps/api && node ace generate:key && node ace migration:run
```

In development:

- **SMS codes** are printed to the API log (`SMS_DRIVER=log`). `OTP_TEST_NUMBERS` lists numbers that always accept a fixed code without any SMS (`+256700000001` / `+5926000001` → `123456`); ignored in production.
- **Payments** use a mock provider (`PAYMENT_DRIVER=mock`) where every escrow deposit and payout succeeds. Real providers (MTN MoMo, Airtel Money, MMG, cards) implement `PaymentDriver` in `apps/api/app/services/payments/`.
- **Customs documents** are stored privately under `apps/api/storage/` and only streamed through authorized routes.

### Connecting the apps

Apps talk to the API through `@a2b/api-client`; request and response types come straight from the API's routes, validators and transformers, so a change on the server shows up as a type error in the apps.

```bash
cp apps/shipper/.env.example apps/shipper/.env
```

`EXPO_PUBLIC_API_URL` defaults to `http://localhost:3333`, which works on the iOS simulator. On the Android emulator either run `adb reverse tcp:3333 tcp:3333` or use `http://10.0.2.2:3333`; on a physical phone use your computer's LAN IP.

Demo data for development (a shipper and open loads in each market):

```bash
cd apps/api && node ace db:seed --files database/seeders/demo_seeder.ts
```

OTP test numbers (code `123456`): shippers `+256700000001` / `+5926000001`, drivers `+256700000002` / `+5926000002` (the same demo drivers `carrier:simulate` uses), fleet owners `+256700000003` / `+5926000003`.

To play the driver's side without the driver app:

```bash
cd apps/api
node ace carrier:simulate A2B-7K3P9Q accept          # → MATCHED (shipper can now fund escrow)
node ace carrier:simulate A2B-7K3P9Q loaded          # → IN_TRANSIT
node ace carrier:simulate A2B-7K3P9Q arrived         # → DELIVERED
node ace carrier:simulate A2B-7K3P9Q release 482915  # code from the shipper's Release Funds screen
```

### Load lifecycle

Every status change goes through `transition()` in `apps/api/app/services/load_lifecycle.ts`, which enforces the shared rules in `@a2b/core` (`canTransition`) and writes an audit row to `load_events`.

| Step | Endpoint | Who | Status |
|---|---|---|---|
| Post | `POST /api/v1/loads` | shipper | → DRAFT |
| Upload customs docs (imports) | `POST /loads/:id/documents` | shipper | DRAFT |
| Publish | `POST /loads/:id/publish` | shipper | → OPEN |
| Accept | `POST /loads/:id/accept` | driver, or fleet owner with `vehicleId` | → MATCHED (escrow opened) |
| Fund escrow | `POST /loads/:id/deposit` | shipper | → SECURED (addresses unlock) |
| Cargo loaded / arrived | `POST /loads/:id/progress` | driver | → IN_TRANSIT → DELIVERED |
| Get release code | `POST /loads/:id/release-code` | shipper | — |
| Enter release code | `POST /loads/:id/release` | driver | → COMPLETED (payout) |
