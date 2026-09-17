import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  const customerId = Number(body?.customerId)
  const totalAmount = Number(body?.totalAmount)
  const bonusUsed = Number(body?.bonusUsed ?? 0)

  // -----------------------------
  // Перевірка вхідних даних
  // -----------------------------

  if (
    !Number.isInteger(customerId) ||
    customerId <= 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний клієнт'
    })
  }

  if (
    !Number.isFinite(totalAmount) ||
    totalAmount <= 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректна сума покупки'
    })
  }

  if (
    !Number.isInteger(bonusUsed) ||
    bonusUsed < 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Некоректна кількість бонусів'
    })
  }

  // -----------------------------
  // Клієнт
  // -----------------------------

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      active: true,
      deletedAt: null
    },
    select: {
      id: true,
      loyaltyActive: true,
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
      statusMessage: 'Клієнта не знайдено'
    })
  }

  if (!customer.loyaltyActive && bonusUsed > 0) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Бонусна програма клієнта не активна'
    })
  }

  // -----------------------------
  // Поточний баланс бонусів
  // -----------------------------

  const bonusBalance =
    customer.bonusTransactions.reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    )

  if (bonusUsed > bonusBalance) {
    throw createError({
      statusCode: 400,
      statusMessage:
        `Недостатньо бонусів. Баланс: ${bonusBalance}`
    })
  }

  // -----------------------------
  // Активна бонусна політика
  // -----------------------------

  const now = new Date()

  const policy = await prisma.bonusPolicy.findFirst({
    where: {
      active: true,
      validFrom: {
        lte: now
      },
      OR: [
        {
          validTo: null
        },
        {
          validTo: {
            gt: now
          }
        }
      ]
    },
    orderBy: {
      validFrom: 'desc'
    }
  })

  if (!policy && bonusUsed > 0) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Активну бонусну політику не знайдено'
    })
  }

  // -----------------------------
  // Максимально допустиме списання
  // -----------------------------

  const maxRedeemPercent =
    policy
      ? Number(policy.maxRedeemPercent)
      : 0

  const maxRedeemByPercent =
    Math.floor(
      totalAmount *
      (maxRedeemPercent / 100)
    )

  const maxBonusAllowed = Math.min(
    bonusBalance,
    maxRedeemByPercent
  )

  if (bonusUsed > maxBonusAllowed) {
    throw createError({
      statusCode: 400,
      statusMessage:
        `Для цієї покупки можна використати максимум ${maxBonusAllowed} бонусів`
    })
  }

  // -----------------------------
  // Сума до оплати
  // -----------------------------

  const paidAmount =
    Math.round(
      (totalAmount - bonusUsed) * 100
    ) / 100

  if (paidAmount < 0) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Сума до оплати не може бути від’ємною'
    })
  }

  // -----------------------------
  // Створюємо PENDING покупку
  // -----------------------------

  const purchase = await prisma.purchase.create({
    data: {
      customerId,

      totalAmount,
      bonusUsed,
      paidAmount,

      bonusEarned: 0,

      policyId:
        policy?.id ?? null,

      maxRedeemPercentSnapshot:
        policy
          ? policy.maxRedeemPercent
          : null,

      maxRewardPointsSnapshot:
        policy?.maxRewardPoints ?? null,

      rewardPercentSnapshot: null,

      source: 'MANUAL',
      status: 'PENDING'
    },
    select: {
      id: true,
      totalAmount: true,
      bonusUsed: true,
      paidAmount: true,
      status: true,
      createdAt: true
    }
  })

  return {
    success: true,

    purchase: {
      id: purchase.id,
      totalAmount:
        Number(purchase.totalAmount),

      bonusUsed:
        purchase.bonusUsed,

      paidAmount:
        Number(purchase.paidAmount),

      status:
        purchase.status,

      createdAt:
        purchase.createdAt
    },

    bonus: {
      balance: bonusBalance,
      used: bonusUsed,
      maxAllowed: maxBonusAllowed,
      maxRedeemPercent
    }
  }
})