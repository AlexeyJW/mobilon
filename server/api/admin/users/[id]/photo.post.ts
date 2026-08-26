import prisma from '../../../../utils/prisma'
import requireAdmin from '../../../../utils/requireAdmin'
import cloudinary from '~~/server/utils/cloudinary'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(event.context.params?.id)

  if (!id || Number.isNaN(id)) {
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
      statusMessage:
        'Only JPG, PNG and WebP images are allowed'
    })
  }

  const maxSize = 10 * 1024 * 1024

  if (file.data.length > maxSize) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Фото занадто велике. Максимальний розмір — 10 MB'
    })
  }

  
  const base64 =
    `data:${file.type};base64,${file.data.toString('base64')}`

  const result = await cloudinary.uploader.upload(base64, {
    folder: 'mobilon-team',
    public_id: `user-${id}`,
    overwrite: true
  })

 

  await prisma.user.update({
    where: { id },
    data: {
      photo: result.secure_url
    }
  })

  return {
    success: true,
    photo: result.secure_url,
    photoId: result.public_id
  }
})