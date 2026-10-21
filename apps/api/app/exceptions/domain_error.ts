import { Exception } from '@adonisjs/core/exceptions'
import type { ApiErrorCode } from '@a2b/core'

/**
 * A rule of the business was broken (wrong status, not your load, bad code…).
 * Rendered as `{ errors: [{ message, code }] }` with the given HTTP status.
 */
export default class DomainError extends Exception {
  declare code: ApiErrorCode

  constructor(message: string, options: { status: number; code: ApiErrorCode }) {
    super(message, options)
  }

  static notFound(message: string) {
    return new DomainError(message, { status: 404, code: 'E_NOT_FOUND' })
  }

  static forbidden(message = 'You are not allowed to do this', code: ApiErrorCode = 'E_FORBIDDEN') {
    return new DomainError(message, { status: 403, code })
  }

  static conflict(message: string, code: ApiErrorCode = 'E_CONFLICT') {
    return new DomainError(message, { status: 409, code })
  }

  static invalid(message: string, code: ApiErrorCode = 'E_INVALID') {
    return new DomainError(message, { status: 422, code })
  }

  static tooMany(message: string) {
    return new DomainError(message, { status: 429, code: 'E_TOO_MANY_ATTEMPTS' })
  }

  async handle(error: this, ctx: { response: any }) {
    ctx.response
      .status(error.status)
      .send({ errors: [{ message: error.message, code: error.code }] })
  }
}

/** Plain-text message for any error (used by CLI commands). */
export function apiErrorMessageFor(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
