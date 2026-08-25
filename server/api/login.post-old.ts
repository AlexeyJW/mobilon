import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import prisma from '../utils/prisma'

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || 'admin-secret-default'

const SESSION_MAX_AGE = 60 * 60 * 24

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const login = String(body?.login || '').trim()
  const password = String(body?.password || '')

  if (!login || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Логін та пароль обов’язкові'
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      username: login
    }
  })

  if (!user || !user.active) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Невірний логін або пароль'
    })
  }

  const isValid = await bcrypt.compare(
    password,
    user.passwordHash
  )

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Невірний логін або пароль'
    })
  }

  const payload = `${Date.now()}|${user.id}|${crypto
    .randomBytes(16)
    .toString('hex')}`

  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex')

  const token = `${payload}.${signature}`

  setCookie(event, 'admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE
  })

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    }
  }
})