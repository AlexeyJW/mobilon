import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = Number(event.context.params?.id)

  if (!id || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id'
    })
  }

  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const username = String(body?.username || '').trim()
  const role = body?.role === 'ADMIN' ? 'ADMIN' : 'MANAGER'

  if (!name || !username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name and username are required'
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      id
    }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  // Не дозволяємо змінити роль самого себе з ADMIN
  if (user.id === admin.id && role !== 'ADMIN') {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot remove admin role from yourself'
    })
  }

  const existingUsername = await prisma.user.findUnique({
    where: {
      username
    }
  })

  if (
    existingUsername &&
    existingUsername.id !== id
  ) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Username already exists'
    })
  }

  const active =
    typeof body?.active === 'boolean'
      ? body.active
      : user.active

  // Не дозволяємо деактивувати самого себе
  if (user.id === admin.id && !active) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot deactivate yourself'
    })
  }

  const updatedUser = await prisma.user.update({
    where: {
      id
    },
    data: {
      name,
      username,
      role,
      active
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return {
    success: true,
    user: updatedUser
  }
})