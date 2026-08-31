
import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(event.context.params?.id)

  if (!id || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid category id'
    })
  }

  const body = await readBody(event)

  const category =
    await prisma.serviceCategory.findUnique({
      where: {
        id
      }
    })

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found'
    })
  }

  const name = String(body?.name || '').trim()

  const sortOrder =
    body?.sortOrder !== undefined &&
    body?.sortOrder !== ''
      ? Number(body.sortOrder)
      : category.sortOrder

  const active =
    typeof body?.active === 'boolean'
      ? body.active
      : category.active

  // -------------------------
  // Validation
  // -------------------------

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
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
  // Check duplicate name
  // -------------------------

  const existingCategory =
    await prisma.serviceCategory.findFirst({
      where: {
        name,
        NOT: {
          id
        }
      }
    })

  if (existingCategory) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Category already exists'
    })
  }

  // -------------------------
  // Update
  // -------------------------

  const updatedCategory =
    await prisma.serviceCategory.update({
      where: {
        id
      },

      data: {
        name,
        sortOrder,
        active
      },

      select: {
        id: true,
        name: true,
        sortOrder: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

  return {
    success: true,
    category: updatedCategory
  }
})
