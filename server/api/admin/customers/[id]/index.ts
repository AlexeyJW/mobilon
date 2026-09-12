import prisma from '../../../../utils/prisma'
import requireAdmin from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(event.context.params?.id)

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний ID клієнта'
    })
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id
    },

    select: {
      id: true,
      name: true,
      phone: true,
      notes: true,

      loyaltyActive: true,
      cardToken: true,
      telegramChatId: true,

      active: true,
      createdAt: true,
      updatedAt: true,

      requests: {
        orderBy: {
          createdAt: 'desc'
        }
      },

      purchases: {
        orderBy: {
          createdAt: 'desc'
        },

        include: {
          items: true
        }
      },

      bonusTransactions: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!customer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Клієнта не знайдено'
    })
  }

  const bonusBalance = customer.bonusTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  )

  const completedPurchases = customer.purchases.filter(
    purchase => purchase.status === 'COMPLETED'
  )

  const purchaseCount = completedPurchases.length

  const totalSpent = completedPurchases.reduce(
    (sum, purchase) =>
      sum + Number(purchase.totalAmount),
    0
  )

  const lastPurchase =
    completedPurchases[0]?.createdAt ?? null

  return {
    success: true,

    customer: {
      ...customer,

      bonusBalance,
      purchaseCount,
      totalSpent,
      lastPurchase,

      hasCard: Boolean(customer.cardToken)
    }
  }
})