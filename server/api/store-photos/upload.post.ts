import cloudinary from '~~/server/utils/cloudinary'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)

    if (!formData?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Файл не знайдено'
      })
    }

    const file = formData.find(item => item.name === 'file')

    if (!file?.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Файл не знайдено'
      })
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]

    if (!allowedTypes.includes(file.type || '')) {
      throw createError({
        statusCode: 400,
        statusMessage: `Непідтримуваний формат: ${file.type}`
      })
    }

    const maxSize = 10 * 1024 * 1024

    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Фото занадто велике. Максимальний розмір — 10 MB'
      })
    }

    console.log('Upload:', {
      type: file.type,
      size: file.data.length
    })

    const base64 =
      `data:${file.type};base64,${file.data.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'mobilon-store'
    })

    console.log('Cloudinary uploaded:', result.public_id)

    return {
      imageUrl: result.secure_url,
      imageId: result.public_id,
      width: result.width,
      height: result.height
    }

  } catch (error: any) {
    console.error('STORE PHOTO UPLOAD ERROR:', error)

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.statusMessage ||
        error?.message ||
        'Не вдалося завантажити фото'
    })
  }
})