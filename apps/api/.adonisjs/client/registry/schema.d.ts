/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.request_otp': {
    methods: ["POST"]
    pattern: '/api/v1/auth/otp'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').requestOtpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').requestOtpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['requestOtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['requestOtp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.verify_otp': {
    methods: ["POST"]
    pattern: '/api/v1/auth/verify'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').verifyOtpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').verifyOtpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['verifyOtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['verifyOtp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'me.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/me_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/me_controller').default['show']>>>
    }
  }
  'me.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/me'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').updateMeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').updateMeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/me_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/me_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'me.upsert_shipper_profile': {
    methods: ["PUT"]
    pattern: '/api/v1/me/shipper-profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').shipperProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').shipperProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/me_controller').default['upsertShipperProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/me_controller').default['upsertShipperProfile']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'me.upsert_driver_profile': {
    methods: ["PUT"]
    pattern: '/api/v1/me/driver-profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').driverProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').driverProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/me_controller').default['upsertDriverProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/me_controller').default['upsertDriverProfile']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fleets.store': {
    methods: ["POST"]
    pattern: '/api/v1/fleet'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/fleet').createFleetValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/fleet').createFleetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fleets.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/fleet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['show']>>>
    }
  }
  'fleets.vehicles': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/fleet/vehicles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['vehicles']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['vehicles']>>>
    }
  }
  'fleets.add_vehicle': {
    methods: ["POST"]
    pattern: '/api/v1/fleet/vehicles'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/fleet').createVehicleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/fleet').createVehicleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['addVehicle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['addVehicle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fleets.update_vehicle': {
    methods: ["PATCH"]
    pattern: '/api/v1/fleet/vehicles/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/fleet').updateVehicleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/fleet').updateVehicleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['updateVehicle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['updateVehicle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fleets.drivers': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/fleet/drivers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['drivers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['drivers']>>>
    }
  }
  'fleets.add_driver': {
    methods: ["POST"]
    pattern: '/api/v1/fleet/drivers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/fleet').addDriverValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/fleet').addDriverValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['addDriver']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fleets_controller').default['addDriver']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'loads.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/loads'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/load').listLoadsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'loads.store': {
    methods: ["POST"]
    pattern: '/api/v1/loads'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/load').createLoadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/load').createLoadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'loads.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/loads/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['show']>>>
    }
  }
  'loads.events': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/loads/:id/events'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['events']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['events']>>>
    }
  }
  'loads.requirements': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/loads/:id/requirements'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['requirements']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['requirements']>>>
    }
  }
  'loads.publish': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/publish'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['publish']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['publish']>>>
    }
  }
  'loads.accept': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/accept'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/load').acceptLoadValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/load').acceptLoadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['accept']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['accept']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'loads.withdraw': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/withdraw'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['withdraw']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['withdraw']>>>
    }
  }
  'loads.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/cancel'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/load').cancelLoadValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/load').cancelLoadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['cancel']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'loads.progress': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/progress'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/load').progressValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/load').progressValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['progress']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/loads_controller').default['progress']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'escrow.deposit': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/deposit'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/load').depositValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/load').depositValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/escrow_controller').default['deposit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/escrow_controller').default['deposit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'escrow.release_code': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/release-code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/escrow_controller').default['releaseCode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/escrow_controller').default['releaseCode']>>>
    }
  }
  'escrow.release': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/release'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/load').releaseValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/load').releaseValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/escrow_controller').default['release']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/escrow_controller').default['release']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'load_documents.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/loads/:id/documents'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/load_documents_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/load_documents_controller').default['index']>>>
    }
  }
  'load_documents.store': {
    methods: ["POST"]
    pattern: '/api/v1/loads/:id/documents'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/load').uploadDocumentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/load').uploadDocumentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/load_documents_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/load_documents_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'load_documents.download': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/loads/:id/documents/:documentId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; documentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/load_documents_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/load_documents_controller').default['download']>>>
    }
  }
}
