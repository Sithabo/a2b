import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '@a2b/core'
import DomainError from '#exceptions/domain_error'

/** Lets only the given roles through. Use after `auth`: `.use([middleware.auth(), middleware.role({ roles: ['admin'] })])`. */
export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: UserRole[] }) {
    if (!options.roles.includes(ctx.auth.getUserOrFail().role)) throw DomainError.forbidden()
    return next()
  }
}
