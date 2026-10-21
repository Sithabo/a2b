/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  paymentWebhooks: typeof routes['payment_webhooks']
  auth: {
    requestOtp: typeof routes['auth.request_otp']
    verifyOtp: typeof routes['auth.verify_otp']
    logout: typeof routes['auth.logout']
  }
  me: {
    show: typeof routes['me.show']
    update: typeof routes['me.update']
    upsertShipperProfile: typeof routes['me.upsert_shipper_profile']
    upsertDriverProfile: typeof routes['me.upsert_driver_profile']
  }
  driverDocuments: {
    index: typeof routes['driver_documents.index']
    store: typeof routes['driver_documents.store']
    download: typeof routes['driver_documents.download']
  }
  fleetInvites: {
    index: typeof routes['fleet_invites.index']
    accept: typeof routes['fleet_invites.accept']
    decline: typeof routes['fleet_invites.decline']
  }
  places: {
    search: typeof routes['places.search']
    details: typeof routes['places.details']
  }
  fleets: {
    store: typeof routes['fleets.store']
    show: typeof routes['fleets.show']
    vehicles: typeof routes['fleets.vehicles']
    addVehicle: typeof routes['fleets.add_vehicle']
    updateVehicle: typeof routes['fleets.update_vehicle']
    drivers: typeof routes['fleets.drivers']
    addDriver: typeof routes['fleets.add_driver']
    invites: typeof routes['fleets.invites']
  }
  loads: {
    index: typeof routes['loads.index']
    store: typeof routes['loads.store']
    show: typeof routes['loads.show']
    events: typeof routes['loads.events']
    requirements: typeof routes['loads.requirements']
    publish: typeof routes['loads.publish']
    accept: typeof routes['loads.accept']
    assign: typeof routes['loads.assign']
    withdraw: typeof routes['loads.withdraw']
    cancel: typeof routes['loads.cancel']
    progress: typeof routes['loads.progress']
    deliver: typeof routes['loads.deliver']
    deliveryPhoto: typeof routes['loads.delivery_photo']
  }
  escrow: {
    deposit: typeof routes['escrow.deposit']
    releaseCode: typeof routes['escrow.release_code']
    release: typeof routes['escrow.release']
  }
  loadDocuments: {
    index: typeof routes['load_documents.index']
    store: typeof routes['load_documents.store']
    download: typeof routes['load_documents.download']
  }
  adminDrivers: {
    index: typeof routes['admin_drivers.index']
    show: typeof routes['admin_drivers.show']
    document: typeof routes['admin_drivers.document']
    review: typeof routes['admin_drivers.review']
  }
}
