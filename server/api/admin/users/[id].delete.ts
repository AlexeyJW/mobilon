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

  if (id === admin.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot deactivate yourself'
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

  await prisma.user.update({
    where: {
      id
    },
    data: {
      active: false
    }
  })

  return {
    success: true
  }
})