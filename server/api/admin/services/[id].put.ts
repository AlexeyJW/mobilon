import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(event.context.params?.id)

  if (!Number.isInteger(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid service ID'
    })
  }

  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const description = String(body?.description || '').trim()

  const price = Number(body?.price)

  const priceFrom =
    typeof body?.priceFrom === 'boolean'
      ? body.priceFrom
      : false

  const sortOrder =
    body?.sortOrder !== undefined &&
    body?.sortOrder !== ''
      ? Number(body.sortOrder)
      : 0

  const categoryId =
    body?.categoryId !== undefined &&
    body?.categoryId !== null &&
    body?.categoryId !== ''
      ? Number(body.categoryId)
      : null

  const active =
    typeof body?.active === 'boolean'
      ? body.active
      : true

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
    !Number.isInteger(sortOrder) ||
    sortOrder < 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sort order'
    })
  }

  // -------------------------
  // Check category
  // -------------------------

  if (categoryId !== null) {
    const category =
      await prisma.serviceCategory.findUnique({
        where: {
          id: categoryId
        }
      })

    if (!category) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category not found'
      })
    }

    if (!category.active) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category is inactive'
      })
    }
  }

  // -------------------------
  // Update service
  // -------------------------

  const service =
    await prisma.service.update({
      where: {
        id
      },

      data: {
        name,
        description: description || null,
        price,
        priceFrom,
        sortOrder,
        categoryId,
        active
      },

      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        priceFrom: true,
        sortOrder: true,
        category: true,
        categoryId: true,
        active: true,
        createdAt: true,
        updatedAt: true,

        categoryRef: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

  return {
    success: true,
    service
  }
})