import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'id')

  if (!param) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Не вказано ID або slug послуги'
    })
  }

  const isNumericId = /^\d+$/.test(param)

  const service = await prisma.service.findFirst({
    where: {
      OR: isNumericId
        ? [
            { id: Number(param) },
            { slug: param }
          ]
        : [
            { slug: param }
          ],
      active: true
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

  return {
    success: true,
    service
  }
})