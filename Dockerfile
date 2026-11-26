# A2B API image (Railway builds this from the repo root).
#
# The API depends on the @a2b/core workspace, so the image keeps the
# monorepo layout: /app/node_modules links @a2b/core to /app/packages/core,
# and the compiled API lives in /app/apps/api.

FROM node:24-slim AS base
WORKDIR /app

# Every workspace's package.json, so `npm ci` accepts the shared lockfile.
# Only the API's and core's dependencies are installed.
FROM base AS manifests
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/shipper/package.json apps/shipper/
COPY apps/fleet/package.json apps/fleet/
COPY apps/driver/package.json apps/driver/
COPY packages/core/package.json packages/core/
COPY packages/ui/package.json packages/ui/
COPY packages/features/package.json packages/features/
COPY packages/api-client/package.json packages/api-client/

FROM manifests AS build
RUN npm ci --workspace=@a2b/api --workspace=@a2b/core --include-workspace-root=false
COPY packages/core packages/core
COPY apps/api apps/api
RUN npm run build -w @a2b/core && cd apps/api && node ace build

FROM manifests AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev --workspace=@a2b/api --workspace=@a2b/core --include-workspace-root=false \
  && npm cache clean --force
COPY --from=build /app/packages/core/dist packages/core/dist
COPY --from=build /app/apps/api/build apps/api
# storage/ holds uploads (mount a volume here); tmp/ is scratch space
RUN mkdir -p apps/api/storage apps/api/tmp && chown -R node:node apps/api/storage apps/api/tmp
USER node
WORKDIR /app/apps/api
ENV HOST=0.0.0.0 PORT=3333
EXPOSE 3333
CMD ["node", "bin/server.js"]
