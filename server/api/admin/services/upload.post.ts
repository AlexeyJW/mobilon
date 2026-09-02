import cloudinary from '~~/server/utils/cloudinary'
import requireAdmin from '~~/server/utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const formData = await readMultipartFormData(event)

  if (!formData?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Файл не знайдено'
    })
  }

  const file = formData.find(item => item.name === 'file')

  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Файл не знайдено'
    })
  }

  const base64 = `data:${file.type};base64,${file.data.toString('base64')}`

  const result = await cloudinary.uploader.upload(base64, {
    folder: 'mobilon-services'
  })

  return {
    imageUrl: result.secure_url,
    imageId: result.public_id,
    width: result.width,
    height: result.height
  }
})