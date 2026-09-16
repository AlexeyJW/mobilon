import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  /* ==================================================
     REWARD RATES
  ================================================== */

  const smartphoneRewardPercent =
    Number(body.smartphoneRewardPercent)

  const featurePhoneRewardPercent =
    Number(body.featurePhoneRewardPercent)

  const accessoryRewardPercent =
    Number(body.accessoryRewardPercent)

  const serviceRewardPercent =
    Number(body.serviceRewardPercent)

  const maxRewardPoints =
    body.maxRewardPoints === null ||
    body.maxRewardPoints === undefined ||
    body.maxRewardPoints === ''
      ? null
      : Number(body.maxRewardPoints)

  /*
   * LEGACY
   *
   * Поки старі частини системи використовують
   * rewardPercent, записуємо сюди ставку
   * товарів / аксесуарів.
   */
  const rewardPercent = accessoryRewardPercent

  /* ==================================================
     REDEEM SETTINGS
  ================================================== */

  const maxRedeemPercent =
    Number(body.maxRedeemPercent)

  const minPurchaseAmount =
    body.minPurchaseAmount === null ||
    body.minPurchaseAmount === undefined ||
    body.minPurchaseAmount === ''
      ? null
      : Number(body.minPurchaseAmount)

  const minRedeemPoints =
    body.minRedeemPoints === null ||
    body.minRedeemPoints === undefined ||
    body.minRedeemPoints === ''
      ? null
      : Number(body.minRedeemPoints)

  const activationDelayDays =
    body.activationDelayDays === null ||
    body.activationDelayDays === undefined ||
    body.activationDelayDays === ''
      ? 0
      : Number(body.activationDelayDays)

  const expirationDays =
    body.expirationDays === null ||
    body.expirationDays === undefined ||
    body.expirationDays === ''
      ? null
      : Number(body.expirationDays)

  /* ==================================================
     VALID FROM
  ================================================== */

  if (!body.validFrom) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Вкажіть дату початку дії політики'
    })
  }

  const validFrom = new Date(body.validFrom)

  if (Number.isNaN(validFrom.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Некоректна дата початку дії політики'
    })
  }

  /* ==================================================
     REWARD VALIDATION
  ================================================== */

  const rewardRates = [
    {
      name: 'Смартфони',
      value: smartphoneRewardPercent
    },
    {
      name: 'Кнопкові телефони',
      value: featurePhoneRewardPercent
    },
    {
      name: 'Товари / аксесуари',
      value: accessoryRewardPercent
    },
    {
      name: 'Послуги',
      value: serviceRewardPercent
    }
  ]

  for (const rate of rewardRates) {
    if (
      !Number.isFinite(rate.value) ||
      rate.value < 0 ||
      rate.value > 100
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          `${rate.name}: відсоток має бути від 0 до 100`
      })
    }
  }

  if (
    maxRewardPoints !== null &&
    (
      !Number.isInteger(maxRewardPoints) ||
      maxRewardPoints <= 0
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Максимум бонусів за покупку має бути цілим числом більше 0'
    })
  }

  /* ==================================================
     REDEEM VALIDATION
  ================================================== */

  if (
    !Number.isFinite(maxRedeemPercent) ||
    maxRedeemPercent < 0 ||
    maxRedeemPercent > 100
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Максимальна оплата бонусами має бути від 0 до 100%'
    })
  }

  if (
    minPurchaseAmount !== null &&
    (
      !Number.isFinite(minPurchaseAmount) ||
      minPurchaseAmount < 0
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Мінімальна сума покупки не може бути від’ємною'
    })
  }

  if (
    minRedeemPoints !== null &&
    (
      !Number.isInteger(minRedeemPoints) ||
      minRedeemPoints < 0
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Мінімальна кількість бонусів має бути цілим невід’ємним числом'
    })
  }

  if (
    !Number.isInteger(activationDelayDays) ||
    activationDelayDays < 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Затримка активації має бути цілим числом днів'
    })
  }

  if (
    expirationDays !== null &&
    (
      !Number.isInteger(expirationDays) ||
      expirationDays <= 0
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Строк дії бонусів має бути цілим числом більше 0'
    })
  }

  /* ==================================================
     CREATE VERSION
  ================================================== */

  const policy = await prisma.$transaction(
    async (tx) => {
      /*
       * Політика, яка діяла безпосередньо
       * перед новою.
       */
      const previousPolicy =
        await tx.bonusPolicy.findFirst({
          where: {
            validFrom: {
              lt: validFrom
            }
          },

          orderBy: {
            validFrom: 'desc'
          }
        })

      /*
       * Наступна вже запланована політика.
       */
      const nextPolicy =
        await tx.bonusPolicy.findFirst({
          where: {
            validFrom: {
              gt: validFrom
            }
          },

          orderBy: {
            validFrom: 'asc'
          }
        })

      /*
       * Не дозволяємо дві політики
       * з однаковою датою початку.
       */
      const sameDatePolicy =
        await tx.bonusPolicy.findFirst({
          where: {
            validFrom
          }
        })

      if (sameDatePolicy) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Політика з такою датою початку вже існує'
        })
      }

      /*
       * Закриваємо попередню політику.
       */
      if (previousPolicy) {
        await tx.bonusPolicy.update({
          where: {
            id: previousPolicy.id
          },

          data: {
            validTo: validFrom
          }
        })
      }

      /*
       * Створюємо нову версію.
       */
      return await tx.bonusPolicy.create({
        data: {
          /* LEGACY */
          rewardPercent,

          /* NEW REWARD RATES */
          smartphoneRewardPercent,
          featurePhoneRewardPercent,
          accessoryRewardPercent,
          serviceRewardPercent,
          maxRewardPoints,

          /* REDEEM */
          maxRedeemPercent,
          minPurchaseAmount,
          minRedeemPoints,

          activationDelayDays,
          expirationDays,

          /*
           * LEGACY CATEGORY FLAGS.
           * Поки залишаємо для сумісності.
           */
          rewardProducts:
            body.rewardProducts === undefined
              ? true
              : body.rewardProducts === true,

          rewardServices:
            body.rewardServices === undefined
              ? true
              : body.rewardServices === true,

          rewardOnBonusPaidPart:
            body.rewardOnBonusPaidPart === undefined
              ? false
              : body.rewardOnBonusPaidPart === true,

          validFrom,

          validTo: nextPolicy
            ? nextPolicy.validFrom
            : null
        }
      })
    }
  )

  return {
    success: true,
    policy
  }
})