import prisma from '../../../utils/prisma'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body.name || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть назву бренду'
    })
  }

  // Перевіряємо, чи такий бренд уже існує
  const existingBrand = await prisma.brand.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive'
      }
    }
  })

  if (existingBrand) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Такий бренд вже існує'
    })
  }

  const slug = slugify(name, {
    lower: true,
    strict: true
  })

  // Додаткова перевірка slug
  const existingSlug = await prisma.brand.findUnique({
    where: {
      slug
    }
  })

  if (existingSlug) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Бренд з таким slug вже існує'
    })
  }

  const brand = await prisma.brand.create({
    data: {
      name,
      slug
    }
  })

  return brand
})