import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const token = event.context.params?.token

  if (!token || typeof token !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний токен'
    })
  }

  const customer = await prisma.customer.findFirst({
    where: {
      cardToken: token,
      loyaltyActive: true,
      active: true,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      bonusTransactions: {
        select: {
          amount: true
        }
      }
    }
  })

  if (!customer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Бонусну картку не знайдено'
    })
  }

  const bonusBalance =
    customer.bonusTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )

  return {
    success: true,
    customer: {
      name: customer.name,
      bonusBalance
    }
  }
})