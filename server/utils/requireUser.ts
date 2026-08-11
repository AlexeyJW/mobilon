import crypto from 'crypto'
import prisma from './prisma'

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || 'admin-secret-default'

const SESSION_MAX_AGE = 60 * 60 * 24

export default async function requireUser(event: any) {
  const session = getCookie(event, 'admin-session')

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const [payload, signature] = session.split('.')

  if (!payload || !signature) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid session'
    })
  }

  const expected = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex')

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  ) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid session'
    })
  }

  const parts = payload.split('|')

  const timestamp = Number(parts[0])
  const userId = Number(parts[1])

  if (
    Number.isNaN(timestamp) ||
    Number.isNaN(userId)
  ) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid session'
    })
  }

  if (timestamp + SESSION_MAX_AGE * 1000 <= Date.now()) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Session expired'
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
    id: true,
    name: true,
    username: true,
    passwordHash: true,
    role: true,
    active: true
}
  })

  if (!user || !user.active) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found or inactive'
    })
  }

  return user
}