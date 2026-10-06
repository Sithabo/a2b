import { createTuyau } from '@tuyau/core/client'
import { registry } from '@a2b/api/registry'

export type { Data } from '@a2b/api/data'

export interface ApiClientOptions {
  baseUrl: string
  /** Current access token, read before every request. */
  getToken: () => string | null | undefined | Promise<string | null | undefined>
  /** Called when the API rejects the token (expired or revoked). */
  onUnauthorized?: () => void
}

/**
 * Typed client for the A2B API. Request bodies, params and responses are inferred
 * from the API's routes, validators and transformers via Tuyau — no hand-written types.
 *
 * ```ts
 * const { data } = await api.api.loads.show({ params: { id } })
 * ```
 */
export function createApiClient({ baseUrl, getToken, onUnauthorized }: ApiClientOptions) {
  return createTuyau({
    baseUrl,
    registry,
    timeout: 20_000,
    retry: { limit: 1, methods: ['get'] },
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await getToken()
          if (token) request.headers.set('Authorization', `Bearer ${token}`)
          request.headers.set('Accept', 'application/json')
        },
      ],
      afterResponse: [
        (_request, _options, response) => {
          if (response.status === 401) onUnauthorized?.()
        },
      ],
    },
  })
}

export type ApiClient = ReturnType<typeof createApiClient>

/** Shape of every A2B API error body. */
export interface ApiErrorBody {
  errors: { message: string; code?: string; field?: string }[]
}

function errorBody(error: unknown): ApiErrorBody | undefined {
  const response = (error as { response?: unknown })?.response
  if (response && typeof response === 'object' && Array.isArray((response as ApiErrorBody).errors)) {
    return response as ApiErrorBody
  }
  return undefined
}

/** Machine-readable error code (e.g. "E_OTP_INVALID"), if the API sent one. */
export function apiErrorCode(error: unknown): string | undefined {
  return errorBody(error)?.errors[0]?.code
}

/** A message that's safe to show the user. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const body = errorBody(error)
  if (body?.errors.length) return body.errors.map((e) => e.message).join('\n')
  if ((error as { kind?: string })?.kind === 'network') {
    return "Can't reach A2B. Check your connection and try again."
  }
  return fallback
}
