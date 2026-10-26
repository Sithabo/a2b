import { randomUUID } from 'node:crypto'
import drive from '@adonisjs/drive/services/main'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import DriverProfile from '#models/driver_profile'
import Fleet from '#models/fleet'
import Load from '#models/load'
import type User from '#models/user'
import { fleetOwnedBy } from '#services/load_access'

/**
 * API path of the user's photo (for AuthImage), or null. The `v` changes with
 * each upload, so apps can cache a photo until it's replaced.
 */
export function avatarPathOf(user: Pick<User, 'id' | 'avatarKey'>) {
  if (!user.avatarKey) return null
  const version = user.avatarKey.split('/').pop()!.slice(0, 8)
  return `users/${user.id}/avatar?v=${version}`
}

export async function setAvatar(user: User, file: MultipartFile) {
  const key = `avatars/${user.id}/${randomUUID()}.${file.extname}`
  // moveFromFs (not file.moveToDisk) keeps this compiling without Drive's MultipartFile augmentation
  await drive.use().moveFromFs(file.tmpPath!, key)
  const replaced = user.avatarKey
  user.avatarKey = key
  await user.save()
  if (replaced) await drive.use().delete(replaced)
}

export async function removeAvatar(user: User) {
  const replaced = user.avatarKey
  if (!replaced) return
  user.avatarKey = null
  await user.save()
  await drive.use().delete(replaced)
}

/**
 * Photos are shown to the people someone works with: their fleet (owner ↔
 * drivers) and the other side of a load they share. Not to everyone.
 */
export async function canSeeAvatar(viewer: User, targetId: number) {
  if (viewer.id === targetId || viewer.role === 'admin') return true

  const fleet = await fleetOwnedBy(viewer)
  if (fleet) {
    const driver = await DriverProfile.query()
      .where('user_id', targetId)
      .where('fleet_id', fleet.id)
      .first()
    if (driver) return true
  }
  if (viewer.role === 'driver') {
    const own = await DriverProfile.findBy('userId', viewer.id)
    if (own?.fleetId) {
      const ownersFleet = await Fleet.query()
        .where('id', own.fleetId)
        .where('owner_id', targetId)
        .first()
      if (ownersFleet) return true
    }
  }

  const shared = await Load.query()
    .where((q) => {
      q.where('shipper_id', viewer.id).orWhere('driver_id', viewer.id)
      if (fleet) q.orWhere('fleet_id', fleet.id)
    })
    .where((q) => q.where('shipper_id', targetId).orWhere('driver_id', targetId))
    .first()
  return !!shared
}
