import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)


  const name = String(body?.name || '').trim()
  const description = String(body?.description || '').trim()

  const categoryId =
    body?.categoryId !== null &&
    body?.categoryId !== undefined &&
    body?.categoryId !== ''
      ? Number(body.categoryId)
      : null

  const price = Number(body?.price)
  const priceFrom = Boolean(body?.priceFrom)

  const sortOrder =
    body?.sortOrder !== undefined &&
    body?.sortOrder !== ''
      ? Number(body.sortOrder)
      : 0
 
      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid sort order'
        })
      }


  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
    })
  }

  if (!Number.isFinite(price) || price < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid price'
    })
  }

  if (
    categoryId !== null &&
    (!Number.isInteger(categoryId) || categoryId <= 0)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid category'
    })
  }

  if (categoryId !== null) {
    const category = await prisma.serviceCategory.findUnique({
      where: {
        id: categoryId
      }
    })

    if (!category || !category.active) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category not found or inactive'
      })
    }
  }

  const service = await prisma.service.create({
   data: {
          name,
          description: description || null,
          categoryId,
          price,
          priceFrom,
          sortOrder,
          active: true
        },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      priceFrom: true,
      sortOrder: true,
      categoryId: true,
      categoryRef: {
        select: {
          id: true,
          name: true
        }
      },
      active: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return {
    success: true,
    service
  }
})