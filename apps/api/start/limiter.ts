/*
|--------------------------------------------------------------------------
| HTTP rate limits
|--------------------------------------------------------------------------
|
| Per-IP limits on the unauthenticated sign-in endpoints, on top of the
| per-phone limits in otp_service. Mobile carriers put many users behind one
| IP (CGNAT), so these are sized to stop scripted abuse — SMS pumping, code
| guessing, hashing load — not a busy cell tower.
|
| Behind a load balancer, configure `http.trustProxy` in config/app.ts so
| request.ip() is the client's address and not the balancer's.
|
*/

import limiter from '@adonisjs/limiter/services/main'

const message = 'Too many attempts from this network. Try again in a few minutes.'

/** Requesting SMS codes costs money per message. */
export const otpRequestThrottle = limiter.define('auth_otp', (ctx) =>
  limiter
    .allowRequests(20)
    .every('10 minutes')
    .usingKey(`ip_${ctx.request.ip()}`)
    .limitExceeded((error) => error.setMessage(message))
)

/** Each verify runs a deliberately slow hash; also caps code guessing per network. */
export const otpVerifyThrottle = limiter.define('auth_verify', (ctx) =>
  limiter
    .allowRequests(30)
    .every('10 minutes')
    .usingKey(`ip_${ctx.request.ip()}`)
    .limitExceeded((error) => error.setMessage(message))
)
