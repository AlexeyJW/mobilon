import bcrypt from 'bcryptjs'

const ADMIN_SECRET = ((globalThis as any).process?.env?.ADMIN_SECRET as string) || 'admin-secret-default'
const SESSION_MAX_AGE = 60 * 60 * 24

async function createSessionToken() {
  // @ts-ignore
  const cryptoModule = await import('crypto')
  const crypto = cryptoModule as any
  const payload = `${Date.now()}|${crypto.randomBytes(16).toString('hex')}`
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex')
  return `${payload}.${signature}`
  
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const login = ((globalThis as any).process?.env?.ADMIN_LOGIN as string) || ''
  const passwordHash = ((globalThis as any).process?.env?.ADMIN_PASSWORD_HASH as string) || ''

  const isValid =
    body.login === login &&
    await bcrypt.compare(body.password, passwordHash)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Невірний логін'
    })
  }

  const token = await createSessionToken()

  setCookie(event, 'admin-session', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE
  })

  return {
    success: true
  }
})