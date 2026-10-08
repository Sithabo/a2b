/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.request_otp': {
    methods: ["POST"],
    pattern: '/api/v1/auth/otp',
    tokens: [{"old":"/api/v1/auth/otp","type":0,"val":"api","end":""},{"old":"/api/v1/auth/otp","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/otp","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/otp","type":0,"val":"otp","end":""}],
    types: placeholder as Registry['auth.request_otp']['types'],
  },
  'auth.verify_otp': {
    methods: ["POST"],
    pattern: '/api/v1/auth/verify',
    tokens: [{"old":"/api/v1/auth/verify","type":0,"val":"api","end":""},{"old":"/api/v1/auth/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/verify","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['auth.verify_otp']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'me.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/me',
    tokens: [{"old":"/api/v1/me","type":0,"val":"api","end":""},{"old":"/api/v1/me","type":0,"val":"v1","end":""},{"old":"/api/v1/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['me.show']['types'],
  },
  'me.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/me',
    tokens: [{"old":"/api/v1/me","type":0,"val":"api","end":""},{"old":"/api/v1/me","type":0,"val":"v1","end":""},{"old":"/api/v1/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['me.update']['types'],
  },
  'me.upsert_shipper_profile': {
    methods: ["PUT"],
    pattern: '/api/v1/me/shipper-profile',
    tokens: [{"old":"/api/v1/me/shipper-profile","type":0,"val":"api","end":""},{"old":"/api/v1/me/shipper-profile","type":0,"val":"v1","end":""},{"old":"/api/v1/me/shipper-profile","type":0,"val":"me","end":""},{"old":"/api/v1/me/shipper-profile","type":0,"val":"shipper-profile","end":""}],
    types: placeholder as Registry['me.upsert_shipper_profile']['types'],
  },
  'me.upsert_driver_profile': {
    methods: ["PUT"],
    pattern: '/api/v1/me/driver-profile',
    tokens: [{"old":"/api/v1/me/driver-profile","type":0,"val":"api","end":""},{"old":"/api/v1/me/driver-profile","type":0,"val":"v1","end":""},{"old":"/api/v1/me/driver-profile","type":0,"val":"me","end":""},{"old":"/api/v1/me/driver-profile","type":0,"val":"driver-profile","end":""}],
    types: placeholder as Registry['me.upsert_driver_profile']['types'],
  },
  'fleets.store': {
    methods: ["POST"],
    pattern: '/api/v1/fleet',
    tokens: [{"old":"/api/v1/fleet","type":0,"val":"api","end":""},{"old":"/api/v1/fleet","type":0,"val":"v1","end":""},{"old":"/api/v1/fleet","type":0,"val":"fleet","end":""}],
    types: placeholder as Registry['fleets.store']['types'],
  },
  'fleets.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/fleet',
    tokens: [{"old":"/api/v1/fleet","type":0,"val":"api","end":""},{"old":"/api/v1/fleet","type":0,"val":"v1","end":""},{"old":"/api/v1/fleet","type":0,"val":"fleet","end":""}],
    types: placeholder as Registry['fleets.show']['types'],
  },
  'fleets.vehicles': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/fleet/vehicles',
    tokens: [{"old":"/api/v1/fleet/vehicles","type":0,"val":"api","end":""},{"old":"/api/v1/fleet/vehicles","type":0,"val":"v1","end":""},{"old":"/api/v1/fleet/vehicles","type":0,"val":"fleet","end":""},{"old":"/api/v1/fleet/vehicles","type":0,"val":"vehicles","end":""}],
    types: placeholder as Registry['fleets.vehicles']['types'],
  },
  'fleets.add_vehicle': {
    methods: ["POST"],
    pattern: '/api/v1/fleet/vehicles',
    tokens: [{"old":"/api/v1/fleet/vehicles","type":0,"val":"api","end":""},{"old":"/api/v1/fleet/vehicles","type":0,"val":"v1","end":""},{"old":"/api/v1/fleet/vehicles","type":0,"val":"fleet","end":""},{"old":"/api/v1/fleet/vehicles","type":0,"val":"vehicles","end":""}],
    types: placeholder as Registry['fleets.add_vehicle']['types'],
  },
  'fleets.update_vehicle': {
    methods: ["PATCH"],
    pattern: '/api/v1/fleet/vehicles/:id',
    tokens: [{"old":"/api/v1/fleet/vehicles/:id","type":0,"val":"api","end":""},{"old":"/api/v1/fleet/vehicles/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/fleet/vehicles/:id","type":0,"val":"fleet","end":""},{"old":"/api/v1/fleet/vehicles/:id","type":0,"val":"vehicles","end":""},{"old":"/api/v1/fleet/vehicles/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['fleets.update_vehicle']['types'],
  },
  'fleets.drivers': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/fleet/drivers',
    tokens: [{"old":"/api/v1/fleet/drivers","type":0,"val":"api","end":""},{"old":"/api/v1/fleet/drivers","type":0,"val":"v1","end":""},{"old":"/api/v1/fleet/drivers","type":0,"val":"fleet","end":""},{"old":"/api/v1/fleet/drivers","type":0,"val":"drivers","end":""}],
    types: placeholder as Registry['fleets.drivers']['types'],
  },
  'fleets.add_driver': {
    methods: ["POST"],
    pattern: '/api/v1/fleet/drivers',
    tokens: [{"old":"/api/v1/fleet/drivers","type":0,"val":"api","end":""},{"old":"/api/v1/fleet/drivers","type":0,"val":"v1","end":""},{"old":"/api/v1/fleet/drivers","type":0,"val":"fleet","end":""},{"old":"/api/v1/fleet/drivers","type":0,"val":"drivers","end":""}],
    types: placeholder as Registry['fleets.add_driver']['types'],
  },
  'loads.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/loads',
    tokens: [{"old":"/api/v1/loads","type":0,"val":"api","end":""},{"old":"/api/v1/loads","type":0,"val":"v1","end":""},{"old":"/api/v1/loads","type":0,"val":"loads","end":""}],
    types: placeholder as Registry['loads.index']['types'],
  },
  'loads.store': {
    methods: ["POST"],
    pattern: '/api/v1/loads',
    tokens: [{"old":"/api/v1/loads","type":0,"val":"api","end":""},{"old":"/api/v1/loads","type":0,"val":"v1","end":""},{"old":"/api/v1/loads","type":0,"val":"loads","end":""}],
    types: placeholder as Registry['loads.store']['types'],
  },
  'loads.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/loads/:id',
    tokens: [{"old":"/api/v1/loads/:id","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['loads.show']['types'],
  },
  'loads.events': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/loads/:id/events',
    tokens: [{"old":"/api/v1/loads/:id/events","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/events","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/events","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/events","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['loads.events']['types'],
  },
  'loads.requirements': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/loads/:id/requirements',
    tokens: [{"old":"/api/v1/loads/:id/requirements","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/requirements","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/requirements","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/requirements","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/requirements","type":0,"val":"requirements","end":""}],
    types: placeholder as Registry['loads.requirements']['types'],
  },
  'loads.publish': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/publish',
    tokens: [{"old":"/api/v1/loads/:id/publish","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/publish","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/publish","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/publish","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/publish","type":0,"val":"publish","end":""}],
    types: placeholder as Registry['loads.publish']['types'],
  },
  'loads.accept': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/accept',
    tokens: [{"old":"/api/v1/loads/:id/accept","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/accept","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/accept","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/accept","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/accept","type":0,"val":"accept","end":""}],
    types: placeholder as Registry['loads.accept']['types'],
  },
  'loads.withdraw': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/withdraw',
    tokens: [{"old":"/api/v1/loads/:id/withdraw","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/withdraw","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/withdraw","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/withdraw","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/withdraw","type":0,"val":"withdraw","end":""}],
    types: placeholder as Registry['loads.withdraw']['types'],
  },
  'loads.cancel': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/cancel',
    tokens: [{"old":"/api/v1/loads/:id/cancel","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/cancel","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/cancel","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/cancel","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/cancel","type":0,"val":"cancel","end":""}],
    types: placeholder as Registry['loads.cancel']['types'],
  },
  'loads.progress': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/progress',
    tokens: [{"old":"/api/v1/loads/:id/progress","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/progress","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/progress","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/progress","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/progress","type":0,"val":"progress","end":""}],
    types: placeholder as Registry['loads.progress']['types'],
  },
  'escrow.deposit': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/deposit',
    tokens: [{"old":"/api/v1/loads/:id/deposit","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/deposit","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/deposit","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/deposit","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/deposit","type":0,"val":"deposit","end":""}],
    types: placeholder as Registry['escrow.deposit']['types'],
  },
  'escrow.release_code': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/release-code',
    tokens: [{"old":"/api/v1/loads/:id/release-code","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/release-code","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/release-code","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/release-code","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/release-code","type":0,"val":"release-code","end":""}],
    types: placeholder as Registry['escrow.release_code']['types'],
  },
  'escrow.release': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/release',
    tokens: [{"old":"/api/v1/loads/:id/release","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/release","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/release","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/release","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/release","type":0,"val":"release","end":""}],
    types: placeholder as Registry['escrow.release']['types'],
  },
  'load_documents.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/loads/:id/documents',
    tokens: [{"old":"/api/v1/loads/:id/documents","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/documents","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/documents","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/documents","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/documents","type":0,"val":"documents","end":""}],
    types: placeholder as Registry['load_documents.index']['types'],
  },
  'load_documents.store': {
    methods: ["POST"],
    pattern: '/api/v1/loads/:id/documents',
    tokens: [{"old":"/api/v1/loads/:id/documents","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/documents","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/documents","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/documents","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/documents","type":0,"val":"documents","end":""}],
    types: placeholder as Registry['load_documents.store']['types'],
  },
  'load_documents.download': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/loads/:id/documents/:documentId',
    tokens: [{"old":"/api/v1/loads/:id/documents/:documentId","type":0,"val":"api","end":""},{"old":"/api/v1/loads/:id/documents/:documentId","type":0,"val":"v1","end":""},{"old":"/api/v1/loads/:id/documents/:documentId","type":0,"val":"loads","end":""},{"old":"/api/v1/loads/:id/documents/:documentId","type":1,"val":"id","end":""},{"old":"/api/v1/loads/:id/documents/:documentId","type":0,"val":"documents","end":""},{"old":"/api/v1/loads/:id/documents/:documentId","type":1,"val":"documentId","end":""}],
    types: placeholder as Registry['load_documents.download']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
