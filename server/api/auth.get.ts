const ADMIN_SECRET = ((globalThis as any).process?.env?.ADMIN_SECRET as string) || 'admin-secret-default'
const SESSION_MAX_AGE = 60 * 60 * 24

async function isValidSessionToken(token: string | undefined) {
  if (!token) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  // @ts-ignore
  const cryptoModule = await import('crypto')
  const crypto = cryptoModule as any
  const expected = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex')

  const globalBuffer = (globalThis as any).Buffer
  const validSignature =
    signature.length === expected.length &&
    crypto.timingSafeEqual(globalBuffer.from(signature), globalBuffer.from(expected))

  if (!validSignature) return false

  const [timestamp] = payload.split('|')
  const expiresAt = Number(timestamp) + SESSION_MAX_AGE * 1000
  return !Number.isNaN(expiresAt) && expiresAt > Date.now()
}

export default defineEventHandler(async (event) => {
  const session = getCookie(event, 'admin-session')

  if (!(await isValidSessionToken(session))) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return { ok: true }
})