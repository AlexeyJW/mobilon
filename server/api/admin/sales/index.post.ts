import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

type BonusCategory =
  | 'SMARTPHONE'
  | 'FEATURE_PHONE'
  | 'ACCESSORY'
  | 'SERVICE'
  | 'NO_REWARD'

type SaleItemInput = {
  type: 'PRODUCT' | 'SERVICE' | 'OTHER'

  bonusCategory?: BonusCategory | null

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


  
const source =
  body.source === 'FISCAL_QR'
    ? 'FISCAL_QR'
    : 'MANUAL'

const fiscalReceiptNumber =
  String(body.fiscalReceiptNumber || '').trim()

const fiscalDeviceNumber =
  String(body.fiscalDeviceNumber || '').trim()

const fiscalReceiptUrl =
  String(body.fiscalReceiptUrl || '').trim()

const fiscalReceiptDate =
  body.fiscalReceiptDate
    ? new Date(body.fiscalReceiptDate)
    : null

const rewardAmount =
  body.rewardAmount === null ||
  body.rewardAmount === undefined
    ? null
    : Number(body.rewardAmount)

const rewardEnabled =
  body.rewardEnabled !== false
  let items = Array.isArray(body.items)
  ? body.items as SaleItemInput[]
  : []
if (
  source === 'FISCAL_QR' &&
  fiscalReceiptDate &&
  Number.isNaN(fiscalReceiptDate.getTime())
) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Некоректна дата фіскального чека'
  })
}
if (source === 'FISCAL_QR') {
  const fiscalTotal = Number(body.totalAmount)

  if (!Number.isFinite(fiscalTotal) || fiscalTotal <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректна сума фіскального чека'
    })
  }

  if (!fiscalReceiptNumber || !fiscalDeviceNumber) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Відсутні дані фіскального чека'
    })
  }

  items = [
    {
      type: 'OTHER',
      name: `Фіскальний чек №${fiscalReceiptNumber}`,
      quantity: 1,
      unitPrice: fiscalTotal
    }
  ]
}

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
if (
  source === 'FISCAL_QR' &&
  bonusUsed !== 0
) {
  throw createError({
    statusCode: 400,
    statusMessage:
      'Для вже виданого фіскального чека не можна списувати бонуси'
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
if (
  item.bonusCategory !== undefined &&
  item.bonusCategory !== null &&
  ![
    'SMARTPHONE',
    'FEATURE_PHONE',
    'ACCESSORY',
    'SERVICE',
    'NO_REWARD'
  ].includes(item.bonusCategory)
) {
  throw createError({
    statusCode: 400,
    statusMessage:
      `Некоректна бонусна категорія: ${item.name}`
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

  bonusCategory:
    item.bonusCategory ?? null,

  productId:
    item.productId || null,

  serviceId:
    item.serviceId || null,

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
if (
  source === 'FISCAL_QR' &&
  rewardEnabled &&
  (
    rewardAmount === null ||
    !Number.isFinite(rewardAmount) ||
    rewardAmount < 0 ||
    rewardAmount > totalAmount
  )
) {
  throw createError({
    statusCode: 400,
    statusMessage:
      'Некоректна сума для нарахування бонусів'
  })
}
  /* ==================================================
     TRANSACTION
  ================================================== */

  const result = await prisma.$transaction(async tx => {


    /* ---------- DUPLICATE FISCAL RECEIPT ---------- */

if (source === 'FISCAL_QR') {
  const existingReceipt = await tx.purchase.findFirst({
    where: {
      fiscalDeviceNumber,
      fiscalReceiptNumber
    },
    select: {
      id: true
    }
  })

  if (existingReceipt) {
    throw createError({
      statusCode: 409,
      statusMessage:
        `Цей фіскальний чек вже зареєстровано як покупку №${existingReceipt.id}`
    })
  }
}

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

    /* ---------- BONUS REWARD BY ITEM ---------- */

    const getRewardPercent = (
      category: BonusCategory | null
    ) => {
      if (!policy || !category) {
        return 0
      }

      switch (category) {
        case 'SMARTPHONE':
          return Number(
            policy.smartphoneRewardPercent
          )

        case 'FEATURE_PHONE':
          return Number(
            policy.featurePhoneRewardPercent
          )

        case 'ACCESSORY':
          return Number(
            policy.accessoryRewardPercent
          )

        case 'SERVICE':
          return Number(
            policy.serviceRewardPercent
          )

        case 'NO_REWARD':
          return 0

        default:
          return 0
      }
    }

    /*
     * Для кожної позиції зберігаємо:
     * - категорію
     * - застосований %
     * - фактично нараховані бонуси
     */
    let preparedItemsWithBonus =
      preparedItems.map(item => ({
        ...item,
        rewardPercentSnapshot: 0,
        bonusEarned: 0
      }))

    let bonusEarned = 0

    if (
      customer.loyaltyActive &&
      policy &&
      rewardEnabled
    ) {
      /*
       * Якщо частина покупки оплачена бонусами
       * і політика забороняє нараховувати бонуси
       * на цю частину, пропорційно зменшуємо
       * базу кожної позиції.
       */
      const paidRatio =
        !policy.rewardOnBonusPaidPart &&
        totalAmount > 0 &&
        bonusUsed > 0
          ? paidAmount / totalAmount
          : 1

      preparedItemsWithBonus =
        preparedItems.map(item => {
          const rewardPercent =
            getRewardPercent(
              item.bonusCategory
            )

          const rewardBase =
            Math.round(
              item.totalPrice *
              paidRatio *
              100
            ) / 100

          const itemBonusEarned =
            Math.floor(
              rewardBase *
              rewardPercent /
              100
            )

          return {
            ...item,

            rewardPercentSnapshot:
              rewardPercent,

            bonusEarned:
              itemBonusEarned
          }
        })

 bonusEarned =
  preparedItemsWithBonus.reduce(
    (sum, item) =>
      sum + item.bonusEarned,
    0
  )

/*
 * Якщо спрацював максимальний ліміт,
 * зменшуємо бонуси позицій так,
 * щоб їх сума точно дорівнювала ліміту.
 */
if (
  policy.maxRewardPoints !== null &&
  bonusEarned > policy.maxRewardPoints
) {
  let remainingBonus =
    policy.maxRewardPoints

  preparedItemsWithBonus =
    preparedItemsWithBonus.map(item => {
      const itemBonusEarned =
        Math.min(
          item.bonusEarned,
          remainingBonus
        )

      remainingBonus -=
        itemBonusEarned

      return {
        ...item,
        bonusEarned:
          itemBonusEarned
      }
    })

  bonusEarned =
    policy.maxRewardPoints
}
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

        maxRewardPointsSnapshot:
          policy?.maxRewardPoints ?? null,

       source,
status: 'COMPLETED',

fiscalReceiptNumber:
  source === 'FISCAL_QR'
    ? fiscalReceiptNumber
    : null,

fiscalDeviceNumber:
  source === 'FISCAL_QR'
    ? fiscalDeviceNumber
    : null,

fiscalReceiptDate:
  source === 'FISCAL_QR'
    ? fiscalReceiptDate
    : null,

fiscalReceiptUrl:
  source === 'FISCAL_QR'
    ? fiscalReceiptUrl
    : null,

items: {
  create: preparedItemsWithBonus.map(item => ({
    productId: item.productId,
    serviceId: item.serviceId,

    name: item.name,
    type: item.type,

    bonusCategory:
      item.bonusCategory,

    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,

    rewardPercentSnapshot:
      item.rewardPercentSnapshot,

    bonusEarned:
      item.bonusEarned
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