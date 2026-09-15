import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'
import { normalizePhone } from '../../../utils/normalizePhone'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const search = query.search?.toString().trim() || ''

  /*
   * Якщо в пошуку є цифри, пробуємо отримати
   * нормалізований номер телефону.
   *
   * 097 777 77 77
   * +380 97 777 77 77
   * 380977777777
   *
   * -> 380977777777
   */
  const normalizedPhone = search
    ? normalizePhone(search)
    : ''

  const customers = await prisma.customer.findMany({
    where: {
      active: true,
      deletedAt: null,

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              },

              ...(normalizedPhone
                ? [
                    {
                      phone: {
                        contains: normalizedPhone
                      }
                    }
                  ]
                : [])
            ]
          }
        : {})
    },

    select: {
      id: true,
      name: true,
      phone: true,

      loyaltyActive: true,
      cardToken: true,

      createdAt: true,
      updatedAt: true,

      bonusTransactions: {
        select: {
          amount: true
        }
      },

      purchases: {
        where: {
          status: 'COMPLETED'
        },

        select: {
          id: true,
          totalAmount: true,
          createdAt: true
        },

        orderBy: {
          createdAt: 'desc'
        }
      }
    },

    orderBy: {
      createdAt: 'desc'
    }
  })

  return customers.map(customer => {
    const bonusBalance = customer.bonusTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )

    const purchaseCount = customer.purchases.length

    const totalSpent = customer.purchases.reduce(
      (sum, purchase) =>
        sum + Number(purchase.totalAmount),
      0
    )

    const lastPurchase =
      customer.purchases[0]?.createdAt || null

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,

      loyaltyActive: customer.loyaltyActive,
      hasCard: Boolean(customer.cardToken),

      bonusBalance,
      purchaseCount,
      totalSpent,
      lastPurchase,

      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }
  })
})