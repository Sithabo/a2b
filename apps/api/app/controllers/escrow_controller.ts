import type { HttpContext } from '@adonisjs/core/http'
import { depositValidator, releaseValidator } from '#validators/load'
import { depositEscrow, issueReleaseCode, releaseEscrow } from '#services/escrow_service'
import LoadsController from '#controllers/loads_controller'

export default class EscrowController {
  /** Shipper funds escrow (mock provider succeeds immediately; real ones may stay pending). */
  async deposit(ctx: HttpContext) {
    const { method } = await ctx.request.validateUsing(depositValidator)
    await depositEscrow(ctx.auth.getUserOrFail(), Number(ctx.params.id), method)
    return new LoadsController().show(ctx)
  }

  /** Shipper gets a fresh 6-digit code to hand to the driver. Shown once; only its hash is stored. */
  async releaseCode({ auth, params, serialize }: HttpContext) {
    const { code, expiresAt } = await issueReleaseCode(auth.getUserOrFail(), Number(params.id))
    return serialize({ code, expiresAt: expiresAt.toISO() })
  }

  /** Driver enters the shipper's code; pays the carrier and completes the load. */
  async release(ctx: HttpContext) {
    const { code } = await ctx.request.validateUsing(releaseValidator)
    await releaseEscrow(ctx.auth.getUserOrFail(), Number(ctx.params.id), code)
    return new LoadsController().show(ctx)
  }
}
