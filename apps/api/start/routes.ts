/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| A2B API. All routes are under /api/v1; everything except requesting and
| verifying an SMS code needs a bearer access token.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => ({ name: 'a2b-api', status: 'ok' }))

router
  .group(() => {
    router
      .group(() => {
        router.post('otp', [controllers.Auth, 'requestOtp'])
        router.post('verify', [controllers.Auth, 'verifyOtp'])
        router.post('logout', [controllers.Auth, 'logout']).use(middleware.auth())
      })
      .prefix('auth')

    router
      .group(() => {
        // Account
        router.get('me', [controllers.Me, 'show'])
        router.patch('me', [controllers.Me, 'update'])
        router.put('me/shipper-profile', [controllers.Me, 'upsertShipperProfile'])
        router.put('me/driver-profile', [controllers.Me, 'upsertDriverProfile'])

        // Fleet (fleet owners)
        router.post('fleet', [controllers.Fleets, 'store'])
        router.get('fleet', [controllers.Fleets, 'show'])
        router.get('fleet/vehicles', [controllers.Fleets, 'vehicles'])
        router.post('fleet/vehicles', [controllers.Fleets, 'addVehicle'])
        router
          .patch('fleet/vehicles/:id', [controllers.Fleets, 'updateVehicle'])
          .where('id', router.matchers.number())
        router.get('fleet/drivers', [controllers.Fleets, 'drivers'])
        router.post('fleet/drivers', [controllers.Fleets, 'addDriver'])

        // Loads
        router
          .group(() => {
            router.get('/', [controllers.Loads, 'index'])
            router.post('/', [controllers.Loads, 'store'])
            router.get(':id', [controllers.Loads, 'show'])
            router.get(':id/events', [controllers.Loads, 'events'])
            router.get(':id/requirements', [controllers.Loads, 'requirements'])
            router.post(':id/publish', [controllers.Loads, 'publish'])
            router.post(':id/accept', [controllers.Loads, 'accept'])
            router.post(':id/withdraw', [controllers.Loads, 'withdraw'])
            router.post(':id/cancel', [controllers.Loads, 'cancel'])
            router.post(':id/progress', [controllers.Loads, 'progress'])

            // Escrow
            router.post(':id/deposit', [controllers.Escrow, 'deposit'])
            router.post(':id/release-code', [controllers.Escrow, 'releaseCode'])
            router.post(':id/release', [controllers.Escrow, 'release'])

            // Customs documents
            router.get(':id/documents', [controllers.LoadDocuments, 'index'])
            router.post(':id/documents', [controllers.LoadDocuments, 'store'])
            router.get(':id/documents/:documentId', [controllers.LoadDocuments, 'download'])
          })
          .prefix('loads')
          .where('id', router.matchers.number())
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')
