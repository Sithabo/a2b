import type { HttpContext } from '@adonisjs/core/http'
import { getMarket, isValidTaxId } from '@a2b/core'
import ShipperProfile from '#models/shipper_profile'
import DriverProfile from '#models/driver_profile'
import DomainError from '#exceptions/domain_error'
import UserTransformer from '#transformers/user_transformer'
import {
  driverProfileValidator,
  shipperProfileValidator,
  updateMeValidator,
} from '#validators/profile'

export default class MeController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load((loader) => loader.load('shipperProfile').load('driverProfile'))
    return serialize(UserTransformer.transform(user))
  }

  async update({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    user.merge(await request.validateUsing(updateMeValidator))
    await user.save()
    return serialize(UserTransformer.transform(user))
  }

  /** Create or update the shipper's business details. */
  async upsertShipperProfile({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'shipper') throw DomainError.forbidden('Only shippers have business details')
    const data = await request.validateUsing(shipperProfileValidator)

    const market = getMarket(user.market)
    if (data.isImporter && (!data.taxId || !isValidTaxId(data.taxId, market))) {
      throw DomainError.invalid(
        `Importers need a valid ${market.taxId.issuer} TIN (${market.taxId.hint})`,
        'E_INVALID_TAX_ID'
      )
    }
    await ShipperProfile.updateOrCreate(
      { userId: user.id },
      { ...data, taxId: data.isImporter ? data.taxId : null }
    )
    await user.load((loader) => loader.load('shipperProfile'))
    return serialize(UserTransformer.transform(user))
  }

  async upsertDriverProfile({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'driver') throw DomainError.forbidden('Only drivers have a driver profile')
    const data = await request.validateUsing(driverProfileValidator)
    const existing = await DriverProfile.findBy('userId', user.id)
    if (existing) {
      existing.merge(data)
      await existing.save()
    } else {
      await DriverProfile.create({
        ...data,
        userId: user.id,
        verificationStatus: 'PENDING',
        completedTrips: 0,
      })
    }
    await user.load((loader) => loader.load('driverProfile'))
    return serialize(UserTransformer.transform(user))
  }
}
