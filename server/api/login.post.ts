import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma'
import { createSession } from '../utils/auth'

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

  // Створюємо нову серверну сесію
  await createSession(event, user.id)

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