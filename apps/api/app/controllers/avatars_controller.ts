import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import User from '#models/user'
import DomainError from '#exceptions/domain_error'
import UserTransformer from '#transformers/user_transformer'
import { avatarValidator } from '#validators/profile'
import { canSeeAvatar, removeAvatar, setAvatar } from '#services/avatar_service'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
}

/** Profile photos: the signed-in user's own, and others' they work with. */
export default class AvatarsController {
  async store({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { file } = await request.validateUsing(avatarValidator)
    await setAvatar(user, file)
    await user.load((loader) => loader.load('shipperProfile').load('driverProfile'))
    return serialize(UserTransformer.transform(user))
  }

  async destroy({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    await removeAvatar(user)
    await user.load((loader) => loader.load('shipperProfile').load('driverProfile'))
    return serialize(UserTransformer.transform(user))
  }

  async show({ auth, params, response }: HttpContext) {
    const targetId = Number(params.id)
    const target = await User.find(targetId)
    if (!target?.avatarKey || !(await canSeeAvatar(auth.getUserOrFail(), targetId))) {
      throw DomainError.notFound('Photo not found')
    }
    const extname = target.avatarKey.split('.').pop()!.toLowerCase()
    response.header('Content-Type', MIME_TYPES[extname] ?? 'application/octet-stream')
    // The path carries a version, so a photo can be cached until it's replaced
    response.header('Cache-Control', 'private, max-age=604800')
    return response.stream(await drive.use().getStream(target.avatarKey))
  }
}
