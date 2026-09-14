import prisma from '../../../../utils/prisma'
import requireAdmin from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const token = event.context.params?.token

  if (!token || typeof token !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний токен картки'
    })
  }

  const customer = await prisma.customer.findFirst({
    where: {
      cardToken: token,
      active: true,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      phone: true,
      loyaltyActive: true,
      cardToken: true
    }
  })

  if (!customer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Клієнта за цією карткою не знайдено'
    })
  }

  return {
    success: true,
    customer
  }
})