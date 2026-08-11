import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma'
import requireUser from '../utils/requireUser'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const currentPassword = String(body?.currentPassword || '')
  const newPassword = String(body?.newPassword || '')

  if (!currentPassword || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть поточний та новий пароль'
    })
  }

  if (newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Новий пароль має містити щонайменше 6 символів'
    })
  }

  const user = await requireUser(event)

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  )

  if (!isCurrentPasswordValid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Невірний поточний пароль'
    })
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    10
  )

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      passwordHash
    }
  })

  return {
    success: true
  }
})