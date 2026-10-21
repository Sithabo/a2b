import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'payment_webhooks': { paramsTuple?: []; params?: {} }
    'auth.request_otp': { paramsTuple?: []; params?: {} }
    'auth.verify_otp': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'me.show': { paramsTuple?: []; params?: {} }
    'me.update': { paramsTuple?: []; params?: {} }
    'me.upsert_shipper_profile': { paramsTuple?: []; params?: {} }
    'me.upsert_driver_profile': { paramsTuple?: []; params?: {} }
    'driver_documents.index': { paramsTuple?: []; params?: {} }
    'driver_documents.store': { paramsTuple?: []; params?: {} }
    'driver_documents.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fleet_invites.index': { paramsTuple?: []; params?: {} }
    'fleet_invites.accept': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fleet_invites.decline': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fleets.store': { paramsTuple?: []; params?: {} }
    'fleets.show': { paramsTuple?: []; params?: {} }
    'fleets.vehicles': { paramsTuple?: []; params?: {} }
    'fleets.add_vehicle': { paramsTuple?: []; params?: {} }
    'fleets.update_vehicle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fleets.drivers': { paramsTuple?: []; params?: {} }
    'fleets.add_driver': { paramsTuple?: []; params?: {} }
    'fleets.invites': { paramsTuple?: []; params?: {} }
    'loads.index': { paramsTuple?: []; params?: {} }
    'loads.store': { paramsTuple?: []; params?: {} }
    'loads.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.events': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.requirements': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.accept': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.assign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.withdraw': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.deliver': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.delivery_photo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'escrow.deposit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'escrow.release_code': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'escrow.release': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'load_documents.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'load_documents.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'load_documents.download': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'documentId': ParamValue} }
    'admin_drivers.index': { paramsTuple?: []; params?: {} }
    'admin_drivers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_drivers.document': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'documentId': ParamValue} }
    'admin_drivers.review': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'me.show': { paramsTuple?: []; params?: {} }
    'driver_documents.index': { paramsTuple?: []; params?: {} }
    'driver_documents.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fleet_invites.index': { paramsTuple?: []; params?: {} }
    'fleets.show': { paramsTuple?: []; params?: {} }
    'fleets.vehicles': { paramsTuple?: []; params?: {} }
    'fleets.drivers': { paramsTuple?: []; params?: {} }
    'fleets.invites': { paramsTuple?: []; params?: {} }
    'loads.index': { paramsTuple?: []; params?: {} }
    'loads.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.events': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.requirements': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.delivery_photo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'load_documents.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'load_documents.download': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'documentId': ParamValue} }
    'admin_drivers.index': { paramsTuple?: []; params?: {} }
    'admin_drivers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_drivers.document': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'documentId': ParamValue} }
  }
  HEAD: {
    'me.show': { paramsTuple?: []; params?: {} }
    'driver_documents.index': { paramsTuple?: []; params?: {} }
    'driver_documents.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fleet_invites.index': { paramsTuple?: []; params?: {} }
    'fleets.show': { paramsTuple?: []; params?: {} }
    'fleets.vehicles': { paramsTuple?: []; params?: {} }
    'fleets.drivers': { paramsTuple?: []; params?: {} }
    'fleets.invites': { paramsTuple?: []; params?: {} }
    'loads.index': { paramsTuple?: []; params?: {} }
    'loads.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.events': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.requirements': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.delivery_photo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'load_documents.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'load_documents.download': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'documentId': ParamValue} }
    'admin_drivers.index': { paramsTuple?: []; params?: {} }
    'admin_drivers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_drivers.document': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'documentId': ParamValue} }
  }
  POST: {
    'payment_webhooks': { paramsTuple?: []; params?: {} }
    'auth.request_otp': { paramsTuple?: []; params?: {} }
    'auth.verify_otp': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'driver_documents.store': { paramsTuple?: []; params?: {} }
    'fleet_invites.accept': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fleet_invites.decline': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fleets.store': { paramsTuple?: []; params?: {} }
    'fleets.add_vehicle': { paramsTuple?: []; params?: {} }
    'fleets.add_driver': { paramsTuple?: []; params?: {} }
    'loads.store': { paramsTuple?: []; params?: {} }
    'loads.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.accept': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.assign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.withdraw': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'loads.deliver': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'escrow.deposit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'escrow.release_code': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'escrow.release': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'load_documents.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_drivers.review': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'me.update': { paramsTuple?: []; params?: {} }
    'fleets.update_vehicle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'me.upsert_shipper_profile': { paramsTuple?: []; params?: {} }
    'me.upsert_driver_profile': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}