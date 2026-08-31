import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(event.context.params?.id)

  if (!id || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid service id'
    })
  }

  const body = await readBody(event)

  const service = await prisma.service.findUnique({
    where: { id }
  })

  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Service not found'
    })
  }

  const name = String(body?.name || '').trim()
  const description = String(body?.description || '').trim()

  const categoryId =
    body?.categoryId !== null &&
    body?.categoryId !== undefined &&
    body?.categoryId !== ''
      ? Number(body.categoryId)
      : null

  const price = Number(body?.price)

  const active =
    typeof body?.active === 'boolean'
      ? body.active
      : service.active

  const priceFrom =
    typeof body?.priceFrom === 'boolean'
      ? body.priceFrom
      : service.priceFrom

  const sortOrder =
    body?.sortOrder !== undefined &&
    body?.sortOrder !== ''
      ? Number(body.sortOrder)
      : service.sortOrder

  // -------------------------
  // Validation
  // -------------------------

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

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sort order'
    })
  }

  // -------------------------
  // Check category
  // -------------------------

  if (categoryId !== null) {
    const categoryRef = await prisma.serviceCategory.findUnique({
      where: {
        id: categoryId
      }
    })

    if (!categoryRef || !categoryRef.active) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category not found or inactive'
      })
    }
  }

  // -------------------------
  // Update
  // -------------------------

  const updatedService = await prisma.service.update({
    where: {
      id
    },

    data: {
      name,
      description: description || null,
      categoryId,
      price,
      priceFrom,
      sortOrder,
      active
    },

    select: {
      id: true,
      name: true,
      description: true,
      price: true,

      categoryId: true,

      categoryRef: {
        select: {
          id: true,
          name: true
        }
      },

      priceFrom: true,
      sortOrder: true,
      active: true,

      createdAt: true,
      updatedAt: true
    }
  })

  return {
    success: true,
    service: updatedService
  }
})