import prisma from '../../../../utils/prisma'
import requireAdmin from '../../../../utils/requireAdmin'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(event.context.params?.id)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user ID'
    })
  }

  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  const formData = await readMultipartFormData(event)

  const file = formData?.find(
    item => item.name === 'photo'
  )

  if (!file?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Photo is required'
    })
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  if (!file.type || !allowedTypes.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only JPG, PNG and WebP images are allowed'
    })
  }

  const extension =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : 'jpg'

  const fileName = `user-${id}-${Date.now()}.${extension}`

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'team'
  )

  await mkdir(uploadDir, {
    recursive: true
  })

  const filePath = path.join(
    uploadDir,
    fileName
  )

  await writeFile(
    filePath,
    file.data
  )

  const photoUrl = `/uploads/team/${fileName}`

  await prisma.user.update({
    where: { id },
    data: {
      photo: photoUrl
    }
  })

  return {
    success: true,
    photo: photoUrl
  }
})