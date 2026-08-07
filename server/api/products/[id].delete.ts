import prisma from '../../utils/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  // Знаходимо товар
  const product = await prisma.product.findUnique({
    where: {
      id
    }
  })

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Товар не знайдено'
    })
  }

  // Якщо є фото — видаляємо його з Cloudinary
  if (product.imageId) {
    await cloudinary.uploader.destroy(product.imageId)
  }

  // Видаляємо товар із бази
  await prisma.product.delete({
    where: {
      id
    }
  })

  return {
    success: true
  }
})