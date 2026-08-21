import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний ID послуги'
    })
  }

  const service = await prisma.service.findUnique({
    where: {
      id
    },
    include: {
      categoryRef: true
    }
  })

  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Послугу не знайдено'
    })
  }

  if (!service.active) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Послуга недоступна'
    })
  }

  return {
    success: true,
    service
  }
})