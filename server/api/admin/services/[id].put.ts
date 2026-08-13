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
  const category = String(body?.category || '').trim()

  const price = Number(body?.price)

  const active =
    typeof body?.active === 'boolean'
      ? body.active
      : service.active

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

  const updatedService = await prisma.service.update({
    where: { id },
    data: {
      name,
      description: description || null,
      category: category || null,
      price,
      active
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
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