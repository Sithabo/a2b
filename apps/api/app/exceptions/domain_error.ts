import { Exception } from '@adonisjs/core/exceptions'

/**
 * A rule of the business was broken (wrong status, not your load, bad code…).
 * Rendered as `{ errors: [{ message, code }] }` with the given HTTP status.
 */
export default class DomainError extends Exception {
  static forbidden(message = 'You are not allowed to do this') {
    return new DomainError(message, { status: 403, code: 'E_FORBIDDEN' })
  }

  static conflict(message: string, code = 'E_CONFLICT') {
    return new DomainError(message, { status: 409, code })
  }

  static invalid(message: string, code = 'E_INVALID') {
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
