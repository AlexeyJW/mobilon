import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'
import requireAdmin from '../../utils/requireAdmin'


export default defineEventHandler(async (event) => {
  const currentUser = await requireAdmin(event)
  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const username = String(body?.username || '').trim()
  const password = String(body?.password || '')
  const role = body?.role === 'ADMIN' ? 'ADMIN' : 'MANAGER'

  if (!name || !username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, username and password are required'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must contain at least 6 characters'
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      username
    }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Username already exists'
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      username,
      passwordHash,
      role,
      active: true
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      active: true,
      createdAt: true
    }
  })

  return {
    success: true,
    user
  }
})