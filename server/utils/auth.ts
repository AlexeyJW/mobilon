import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie } from 'h3'
import { prisma } from './prisma'

const SESSION_COOKIE = 'admin-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 днів

function hashToken(token: string) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

export async function createSession(
  event: H3Event,
  userId: number
) {
  const token = generateToken()
  const tokenHash = hashToken(token)

  const expiresAt = new Date(
    Date.now() + SESSION_MAX_AGE * 1000
  )

  // Для адмінки залишаємо одну активну сесію
  await prisma.session.deleteMany({
    where: {
      userId
    }
  })

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  })

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
  })

  return token
}

export async function getCurrentUser(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)

  if (!token) {
    return null
  }

  const tokenHash = hashToken(token)

  const session = await prisma.session.findUnique({
    where: {
      tokenHash
    },
    include: {
      user: true
    }
  })
 
  if (!session) {
    return null
  }

  if (session.revokedAt) {
    return null
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id
      }
    })

    return null
  }

  if (!session.user.active) {
    return null
  }

  return session.user
}

export async function requireAuth(event: H3Event) {
  const user = await getCurrentUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Користувач не авторизований'
    })
  }

  return user
}

export async function requireRole(
  event: H3Event,
  role: 'ADMIN' | 'MANAGER'
) {
  const user = await requireAuth(event)

  if (user.role !== role) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Недостатньо прав'
    })
  }

  return user
}

export async function revokeCurrentSession(
  event: H3Event
) {
  const token = getCookie(event, SESSION_COOKIE)

  if (token) {
    const tokenHash = hashToken(token)

    await prisma.session.updateMany({
      where: {
        tokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    })
  }

  setCookie(event, SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
}