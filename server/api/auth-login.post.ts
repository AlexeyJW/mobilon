import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma'
import crypto from 'crypto'

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || 'admin-secret-default'

const SESSION_MAX_AGE = 60 * 60 * 24

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const username = String(body?.username || '').trim()
  const password = String(body?.password || '')

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      username
    }
  })

  if (!user || !user.active) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  )

  if (!passwordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const payload = `${Date.now()}|${user.id}`

  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex')

  const token = `${payload}.${signature}`

  setCookie(event, 'admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/'
  })

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    }
  }
})