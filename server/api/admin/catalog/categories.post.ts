import prisma from '../../../utils/prisma'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body.name || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть назву категорії'
    })
  }

  const slug = body.slug
    ? String(body.slug).trim()
    : slugify(name, {
        lower: true,
        strict: true,
        locale: 'uk'
      })

  const existingCategory =
    await prisma.category.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: 'insensitive'
            }
          },
          {
            slug
          }
        ]
      }
    })

  if (existingCategory) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Категорія з такою назвою або slug вже існує'
    })
  }

  let parentId: number | null = null

  if (
    body.parentId !== null &&
    body.parentId !== undefined &&
    body.parentId !== ''
  ) {
    parentId = Number(body.parentId)

    if (Number.isNaN(parentId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Некоректна батьківська категорія'
      })
    }

    const parent =
      await prisma.category.findUnique({
        where: {
          id: parentId
        }
      })

    if (!parent) {
      throw createError({
        statusCode: 404,
        statusMessage:
          'Батьківську категорію не знайдено'
      })
    }
  }

  return prisma.category.create({
    data: {
      name,
      slug,

      parentId,

      active:
        body.active === undefined
          ? true
          : Boolean(body.active),

      sortOrder: Number(body.sortOrder || 0)
    }
  })
})