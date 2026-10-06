# A2B

npm-workspaces monorepo for the A2B freight apps.

```
apps/
  shipper/     Expo app — shippers post loads and track them
packages/
  core/        Domain types, status machine, pricing, market config (GY + UG)
  ui/          Design tokens and shared components
backend/       Database schema
design/        Design references (Stitch exports)
```

Packages ship TypeScript source (`main: src/index.ts`); Metro compiles them, so edits show up in every app instantly.

## Commands

```bash
npm install            # once, from the repo root
npm run shipper        # start the shipper app
npm run typecheck      # tsc across all workspaces
```

Native dependencies (reanimated, svg, gesture-handler, …) must be installed in each app that uses them; shared packages list them as `peerDependencies`. Keep Expo/React/React Native versions identical across apps (`npx expo install --check`).
