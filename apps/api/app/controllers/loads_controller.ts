import drive from '@adonisjs/drive/services/main'
import LoadDelivery from '#models/load_delivery'
import type { HttpContext } from '@adonisjs/core/http'
import Load from '#models/load'
import DomainError from '#exceptions/domain_error'
import LoadTransformer from '#transformers/load_transformer'
import LoadEventTransformer from '#transformers/load_event_transformer'
import {
  acceptLoadValidator,
  assignLoadValidator,
  cancelLoadValidator,
  createLoadValidator,
  listLoadsValidator,
  deliverValidator,
  progressValidator,
} from '#validators/load'
import { actorFor, canSeeLocation, canView, fleetOwnedBy } from '#services/load_access'
import {
  acceptLoad,
  assignLoad,
  cancelLoad,
  createLoad,
  missingDocuments,
  publishLoad,
  deliverLoad,
  reportProgress,
  withdrawFromLoad,
} from '#services/load_service'
import type User from '#models/user'

async function findVisible(id: number, user: User) {
  const load = await Load.query()
    .where('id', id)
    .preload('location')
    .preload('escrow')
    .preload('driver')
    .preload('vehicle')
    .preload('delivery')
    .first()
  if (!load || !(await canView(load, user))) {
    throw DomainError.notFound('Load not found')
  }
  return load
}

export default class LoadsController {
  /** Shippers: their loads. Carriers: `scope=board` for open loads, otherwise loads they carry. */
  async index({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { scope = 'mine', page = 1 } = await request.validateUsing(listLoadsValidator)
    const query = Load.query().preload('escrow').orderBy('id', 'desc')

    if (user.role === 'shipper') {
      query.where('shipper_id', user.id)
    } else if (scope === 'board') {
      query.where('market', user.market).where('status', 'OPEN')
    } else if (user.role === 'fleet_owner') {
      const fleet = await fleetOwnedBy(user)
      query.where('fleet_id', fleet?.id ?? 0)
    } else {
      query.where('driver_id', user.id)
    }

    const loads = await query.paginate(page, 20)
    return serialize(LoadTransformer.paginate(loads.all(), loads.getMeta()))
  }

  async store({ auth, request, response, serialize }: HttpContext) {
    const load = await createLoad(
      auth.getUserOrFail(),
      await request.validateUsing(createLoadValidator)
    )
    await load.load((loader) => loader.load('location').load('escrow'))
    response.status(201)
    return serialize(LoadTransformer.transform(load, { showLocation: true }))
  }

  async show({ auth, params, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const load = await findVisible(Number(params.id), user)
    return serialize(
      LoadTransformer.transform(load, { showLocation: await canSeeLocation(load, user) })
    )
  }

  /** The load's history. Only its shipper and carrier: notes name drivers and trucks. */
  async events({ auth, params, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const load = await findVisible(Number(params.id), user)
    if (!(await actorFor(load, user))) throw DomainError.notFound('Load not found')
    await load.load('events', (q) => q.orderBy('id'))
    return serialize(LoadEventTransformer.transform(load.events))
  }

  /** Customs documents still needed before an import load can be published. */
  async requirements({ auth, params, serialize }: HttpContext) {
    const load = await findVisible(Number(params.id), auth.getUserOrFail())
    const missing = await missingDocuments(load)
    return serialize({ missing: missing.map(({ id, label, issuer }) => ({ id, label, issuer })) })
  }

  async publish(ctx: HttpContext) {
    await publishLoad(ctx.auth.getUserOrFail(), Number(ctx.params.id))
    return this.show(ctx)
  }

  async accept(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(acceptLoadValidator)
    await acceptLoad(ctx.auth.getUserOrFail(), Number(ctx.params.id), input)
    return this.show(ctx)
  }

  /** Fleet owner changes the truck and/or driver before pickup. */
  async assign(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(assignLoadValidator)
    await assignLoad(ctx.auth.getUserOrFail(), Number(ctx.params.id), input)
    return this.show(ctx)
  }

  async withdraw(ctx: HttpContext) {
    await withdrawFromLoad(ctx.auth.getUserOrFail(), Number(ctx.params.id))
    return { message: 'You have withdrawn from this load' }
  }

  async cancel(ctx: HttpContext) {
    const { reason } = await ctx.request.validateUsing(cancelLoadValidator)
    await cancelLoad(ctx.auth.getUserOrFail(), Number(ctx.params.id), reason)
    return this.show(ctx)
  }

  async progress(ctx: HttpContext) {
    const { status } = await ctx.request.validateUsing(progressValidator)
    await reportProgress(ctx.auth.getUserOrFail(), Number(ctx.params.id), status)
    return this.show(ctx)
  }

  /** Driver arrives: receiver's name and a photo of the cargo (multipart). */
  async deliver(ctx: HttpContext) {
    const { receiverName, photo } = await ctx.request.validateUsing(deliverValidator)
    await deliverLoad(ctx.auth.getUserOrFail(), Number(ctx.params.id), {
      receiverName,
      photo: {
        tmpPath: photo.tmpPath!,
        extname: photo.extname!,
        mimeType: `${photo.type}/${photo.subtype}`,
        size: photo.size,
      },
    })
    return this.show(ctx)
  }

  /** The proof-of-delivery photo, for the shipper, driver and fleet owner on the load. */
  async deliveryPhoto({ auth, params, response }: HttpContext) {
    const load = await Load.find(params.id)
    if (!load || !(await actorFor(load, auth.getUserOrFail()))) {
      throw DomainError.notFound('Load not found')
    }
    const delivery = await LoadDelivery.findBy('loadId', load.id)
    if (!delivery) throw DomainError.notFound('No proof of delivery yet')
    response.header('Content-Type', delivery.photoMimeType)
    response.header('Cache-Control', 'private, no-store')
    return response.stream(await drive.use().getStream(delivery.photoKey))
  }
}
