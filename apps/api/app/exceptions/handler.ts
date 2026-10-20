import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import DomainError from '#exceptions/domain_error'

/**
 * Postgres errors caused by the request rather than the server, mapped to
 * client errors. They are a backstop for races the services can't fully
 * rule out (two requests creating the same row at once), not a substitute
 * for validation.
 */
const POSTGRES_CLIENT_ERRORS: Record<string, () => DomainError> = {
  '23505': () => DomainError.conflict('This already exists. Refresh and try again.'),
  '23503': () => DomainError.invalid('This refers to something that no longer exists.'),
  '22P02': () => DomainError.invalid('One of the values sent is not in the right format.'),
}

function postgresClientError(error: unknown) {
  const code = (error as { code?: unknown })?.code
  return typeof code === 'string' ? POSTGRES_CLIENT_ERRORS[code]?.() : undefined
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(postgresClientError(error) ?? error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
