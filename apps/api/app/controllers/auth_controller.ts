import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import DomainError from '#exceptions/domain_error'
import UserTransformer from '#transformers/user_transformer'
import { requestOtpValidator, verifyOtpValidator } from '#validators/auth'
import { requestOtp, verifyOtp } from '#services/otp_service'

export default class AuthController {
  /** Sends a 6-digit code by SMS. */
  async requestOtp({ request, serialize }: HttpContext) {
    const { phone } = await request.validateUsing(requestOtpValidator)
    return serialize(await requestOtp(phone))
  }

  /**
   * Verifies the code and returns an access token. First-time numbers must say
   * which role they're signing up as; the market comes from the phone number.
   */
  async verifyOtp({ request, serialize }: HttpContext) {
    const { phone: input, code, role } = await request.validateUsing(verifyOtpValidator)
    const { phone, market } = await verifyOtp(input, code)

    let user = await User.findBy('phone', phone)
    const isNewUser = !user
    if (!user) {
      if (!role)
        throw DomainError.invalid(
          'Choose whether you are a shipper, driver or fleet owner',
          'E_ROLE_REQUIRED'
        )
      user = await User.create({ phone, market, role, phoneVerifiedAt: DateTime.now() })
    } else if (!user.phoneVerifiedAt) {
      // e.g. a driver added by their fleet owner signing in for the first time
      user.phoneVerifiedAt = DateTime.now()
      await user.save()
    }

    const token = await User.accessTokens.create(user, ['*'], {
      name: 'mobile',
      expiresIn: '90 days',
    })
    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
      isNewUser,
    })
  }

  async logout({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken)
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return { message: 'Logged out' }
  }
}
