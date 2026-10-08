import type { HttpContext } from '@adonisjs/core/http'
import DriverProfile from '#models/driver_profile'
import Vehicle from '#models/vehicle'
import FleetTransformer from '#transformers/fleet_transformer'
import VehicleTransformer from '#transformers/vehicle_transformer'
import FleetDriverTransformer from '#transformers/fleet_driver_transformer'
import {
  addDriverValidator,
  createFleetValidator,
  createVehicleValidator,
  updateVehicleValidator,
} from '#validators/fleet'
import {
  addDriver,
  addVehicle,
  createFleet,
  requireFleet,
  updateVehicle,
} from '#services/fleet_service'

export default class FleetsController {
  async store({ auth, request, response, serialize }: HttpContext) {
    const fleet = await createFleet(
      auth.getUserOrFail(),
      await request.validateUsing(createFleetValidator)
    )
    response.status(201)
    return serialize(FleetTransformer.transform(fleet))
  }

  async show({ auth, serialize }: HttpContext) {
    return serialize(FleetTransformer.transform(await requireFleet(auth.getUserOrFail())))
  }

  async vehicles({ auth, serialize }: HttpContext) {
    const fleet = await requireFleet(auth.getUserOrFail())
    const vehicles = await Vehicle.query().where('fleet_id', fleet.id).orderBy('id')
    return serialize(VehicleTransformer.transform(vehicles))
  }

  async addVehicle({ auth, request, response, serialize }: HttpContext) {
    const vehicle = await addVehicle(
      auth.getUserOrFail(),
      await request.validateUsing(createVehicleValidator)
    )
    response.status(201)
    return serialize(VehicleTransformer.transform(vehicle))
  }

  async updateVehicle({ auth, params, request, serialize }: HttpContext) {
    const changes = await request.validateUsing(updateVehicleValidator)
    const vehicle = await updateVehicle(auth.getUserOrFail(), Number(params.id), changes)
    return serialize(VehicleTransformer.transform(vehicle))
  }

  async drivers({ auth, serialize }: HttpContext) {
    const fleet = await requireFleet(auth.getUserOrFail())
    const drivers = await DriverProfile.query()
      .where('fleet_id', fleet.id)
      .preload('user')
      .orderBy('id')
    return serialize(FleetDriverTransformer.transform(drivers))
  }

  async addDriver({ auth, request, response, serialize }: HttpContext) {
    const driver = await addDriver(
      auth.getUserOrFail(),
      await request.validateUsing(addDriverValidator)
    )
    const profile = await DriverProfile.query()
      .where('user_id', driver.id)
      .preload('user')
      .firstOrFail()
    response.status(201)
    return serialize(FleetDriverTransformer.transform(profile))
  }
}
