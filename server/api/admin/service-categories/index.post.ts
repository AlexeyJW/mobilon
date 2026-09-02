import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  const name = String(body?.name || '').trim()

  const sortOrder =
    body?.sortOrder !== undefined &&
    body?.sortOrder !== ''
      ? Number(body.sortOrder)
      : 0

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
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

  if (existingCategory) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category already exists'
    })
  }

  // -------------------------
  // Create
  // -------------------------

  const category =
    await prisma.serviceCategory.create({
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
    category
  }
})