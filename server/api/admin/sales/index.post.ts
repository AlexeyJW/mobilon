import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

type SaleItemInput = {
  type: 'PRODUCT' | 'SERVICE' | 'OTHER'

  productId?: number | null
  serviceId?: number | null

  name: string
  quantity: number
  unitPrice: number
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  const customerId = Number(body.customerId)
  const bonusUsed = Number(body.bonusUsed || 0)

  const items = Array.isArray(body.items)
    ? body.items as SaleItemInput[]
    : []

  /* ==================================================
     VALIDATION
  ================================================== */

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний клієнт'
    })
  }

  if (!Number.isInteger(bonusUsed) || bonusUsed < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректна кількість бонусів'
    })
  }

  if (!items.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Додайте хоча б одну позицію'
    })
  }

  for (const item of items) {
    if (
      !['PRODUCT', 'SERVICE', 'OTHER'].includes(item.type)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Некоректний тип позиції'
      })
    }

    if (!String(item.name || '').trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'У позиції відсутня назва'
      })
    }

    const quantity = Number(item.quantity)
    const unitPrice = Number(item.unitPrice)

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: `Некоректна кількість: ${item.name}`
      })
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: `Некоректна ціна: ${item.name}`
      })
    }
  }

  /* ==================================================
     TOTAL
  ================================================== */

  const preparedItems = items.map(item => {
    const quantity = Number(item.quantity)
    const unitPrice = Number(item.unitPrice)

    const totalPrice =
      Math.round(quantity * unitPrice * 100) / 100

    return {
      type: item.type,
      productId: item.productId || null,
      serviceId: item.serviceId || null,

      name: item.name.trim(),

      quantity,
      unitPrice,
      totalPrice
    }
  })

  const totalAmount =
    Math.round(
      preparedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      ) * 100
    ) / 100

  if (totalAmount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Сума покупки повинна бути більшою за 0'
    })
  }

  /* ==================================================
     TRANSACTION
  ================================================== */

  const result = await prisma.$transaction(async tx => {

    /* ---------- CUSTOMER ---------- */

    const customer = await tx.customer.findUnique({
      where: {
        id: customerId
      },

      select: {
        id: true,
        name: true,
        active: true,
        loyaltyActive: true
      }
    })

    if (!customer || !customer.active) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Клієнта не знайдено'
      })
    }

    /* ---------- CURRENT POLICY ---------- */

    const now = new Date()

    const policy = await tx.bonusPolicy.findFirst({
      where: {
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

    /*
     * Якщо бонусна програма клієнта активна,
     * повинна існувати бонусна політика.
     */

    if (customer.loyaltyActive && !policy) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Немає активної бонусної політики'
      })
    }

    /* ---------- BONUS BALANCE ---------- */

    const bonusAggregate =
      await tx.bonusTransaction.aggregate({
        where: {
          customerId
        },

        _sum: {
          amount: true
        }
      })

    const bonusBalance =
      bonusAggregate._sum.amount || 0

    /* ---------- BONUS REDEMPTION ---------- */

    let allowedBonus = 0

    if (
      customer.loyaltyActive &&
      policy
    ) {
      const maxRedeemPercent =
        Number(policy.maxRedeemPercent)

      const maxByPolicy = Math.floor(
        totalAmount *
        maxRedeemPercent /
        100
      )

      allowedBonus = Math.min(
        Math.max(0, bonusBalance),
        maxByPolicy,
        Math.floor(totalAmount)
      )
    }

    if (bonusUsed > allowedBonus) {
      throw createError({
        statusCode: 400,
        statusMessage:
          `Можна використати максимум ${allowedBonus} бонусів`
      })
    }

    if (
      bonusUsed > 0 &&
      !customer.loyaltyActive
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Бонусна програма клієнта не активна'
      })
    }

    const paidAmount =
      Math.round(
        (totalAmount - bonusUsed) * 100
      ) / 100

    /* ---------- ELIGIBLE AMOUNT ---------- */

    let eligibleAmount = 0

    if (
      customer.loyaltyActive &&
      policy
    ) {
      for (const item of preparedItems) {
        if (
          item.type === 'PRODUCT' &&
          policy.rewardProducts
        ) {
          eligibleAmount += item.totalPrice
        }

        if (
          item.type === 'SERVICE' &&
          policy.rewardServices
        ) {
          eligibleAmount += item.totalPrice
        }
      }
    }

    eligibleAmount =
      Math.round(eligibleAmount * 100) / 100

    /* ---------- REWARD BASE ---------- */

    let rewardBase = eligibleAmount

    if (
      policy &&
      !policy.rewardOnBonusPaidPart &&
      totalAmount > 0 &&
      bonusUsed > 0
    ) {
      const paidRatio =
        paidAmount / totalAmount

      rewardBase =
        eligibleAmount * paidRatio
    }

    rewardBase =
      Math.round(rewardBase * 100) / 100

    /* ---------- BONUS EARNED ---------- */

    let bonusEarned = 0

    if (
      customer.loyaltyActive &&
      policy
    ) {
      const rewardPercent =
        Number(policy.rewardPercent)

      bonusEarned = Math.floor(
        rewardBase *
        rewardPercent /
        100
      )
    }

    /* ---------- CREATE PURCHASE ---------- */

    const purchase = await tx.purchase.create({
      data: {
        customerId,

        totalAmount,
        bonusUsed,
        paidAmount,
        bonusEarned,

        policyId: policy?.id || null,

        rewardPercentSnapshot:
          policy?.rewardPercent || null,

        maxRedeemPercentSnapshot:
          policy?.maxRedeemPercent || null,

        source: 'MANUAL',
        status: 'COMPLETED',

        items: {
          create: preparedItems.map(item => ({
            productId: item.productId,
            serviceId: item.serviceId,

            name: item.name,
            type: item.type,

            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },

      include: {
        items: true
      }
    })

    /* ---------- BONUS PAYMENT ---------- */

    if (bonusUsed > 0) {
      await tx.bonusTransaction.create({
        data: {
          customerId,

          purchaseId: purchase.id,

          amount: -bonusUsed,

          type: 'PURCHASE_PAYMENT',

          reason:
            `Оплата бонусами за покупку №${purchase.id}`,

          description:
            `Використано ${bonusUsed} бонусів`,

          policyId: policy?.id || null
        }
      })
    }

    /* ---------- BONUS REWARD ---------- */

    if (
      bonusEarned > 0 &&
      policy
    ) {
      await tx.bonusTransaction.create({
        data: {
          customerId,

          purchaseId: purchase.id,

          amount: bonusEarned,

          type: 'PURCHASE_REWARD',

          reason:
            `Бонуси за покупку №${purchase.id}`,

          description:
            `${Number(policy.rewardPercent)}% від покупки`,

          policyId: policy.id,

          rewardPercentSnapshot:
            policy.rewardPercent
        }
      })
    }

    return {
      purchase,
      bonusBalanceBefore: bonusBalance,
      bonusUsed,
      bonusEarned,
      bonusBalanceAfter:
        bonusBalance -
        bonusUsed +
        bonusEarned,

      maxBonusAllowed: allowedBonus
    }
  })

  return {
    success: true,
    ...result
  }
})