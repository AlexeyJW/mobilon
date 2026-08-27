import bcrypt from 'bcryptjs'
import prisma from '../../../../utils/prisma'
import requireAdmin from '../../../../utils/requireAdmin'

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

  const newPassword = String(body?.password || '')

  if (!newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is required'
    })
  }

  if (newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Пароль має містити щонайменше 6 символів'
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

  const passwordHash = await bcrypt.hash(
    newPassword,
    10
  )

  await prisma.user.update({
    where: {
      id
    },
    data: {
      passwordHash
    }
  })

  

  return {
    success: true
  }
})