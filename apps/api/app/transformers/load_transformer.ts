import type Load from '#models/load'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { avatarPathOf } from '#services/avatar_service'

export interface LoadViewOptions {
  /** Exact addresses and contacts — only for the shipper, or the carrier once escrow is funded. */
  showLocation: boolean
}

export default class LoadTransformer extends BaseTransformer<Load> {
  constructor(
    resource: Load,
    protected options: LoadViewOptions = { showLocation: false }
  ) {
    super(resource)
  }

  toObject() {
    const location = this.resource.$preloaded.location ? this.resource.location : null
    const escrow = this.resource.$preloaded.escrow ? this.resource.escrow : null
    const driver = this.resource.$preloaded.driver ? this.resource.driver : null
    const vehicle = this.resource.$preloaded.vehicle ? this.resource.vehicle : null
    const delivery = this.resource.$preloaded.delivery ? this.resource.delivery : null
    return {
      ...this.pick(this.resource, [
        'id',
        'reference',
        'market',
        'status',
        'pickupSummary',
        'dropoffSummary',
        'isImport',
        'containerId',
        'cargoType',
        'cargo',
        'weightKg',
        'offerPrice',
        'readyAt',
        'deadlineAt',
        'driverId',
        'fleetId',
        'vehicleId',
        'postedAt',
        'matchedAt',
        'securedAt',
        'inTransitAt',
        'deliveredAt',
        'completedAt',
        'cancelledAt',
        'createdAt',
      ]),
      location:
        this.options.showLocation && location
          ? {
              pickupAddress: location.pickupAddress,
              pickupLat: location.pickupLat,
              pickupLng: location.pickupLng,
              pickupContactName: location.pickupContactName,
              pickupContactPhone: location.pickupContactPhone,
              dropoffAddress: location.dropoffAddress,
              dropoffLat: location.dropoffLat,
              dropoffLng: location.dropoffLng,
              receiverName: location.receiverName,
              receiverPhone: location.receiverPhone,
            }
          : null,
      /** Who is carrying the load — masked until escrow is funded (same rule as `location`). */
      carrier:
        this.options.showLocation && driver
          ? {
              driverName: driver.fullName,
              driverPhone: driver.phone,
              driverAvatarPath: avatarPathOf(driver),
              vehicle: vehicle
                ? {
                    plate: vehicle.plate,
                    make: vehicle.make,
                    model: vehicle.model,
                    vehicleClass: vehicle.vehicleClass,
                    bodyType: vehicle.bodyType,
                    capacityTons: vehicle.capacityTons,
                  }
                : null,
            }
          : null,
      /** Proof of delivery; the photo is at GET /loads/:id/delivery-photo. */
      delivery: delivery
        ? { receiverName: delivery.receiverName, deliveredAt: delivery.createdAt }
        : null,
      escrow: escrow
        ? {
            status: escrow.status,
            amount: escrow.amount,
            currency: escrow.currency,
            depositMethod: escrow.depositMethod,
            /** Unfunded matches go back on the board after this. */
            fundingDueAt: escrow.fundingDueAt,
            releaseCodeExpiresAt: escrow.releaseCodeExpiresAt,
          }
        : null,
    }
  }
}
