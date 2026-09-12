import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  const rewardPercent = Number(body.rewardPercent)
  const maxRedeemPercent = Number(body.maxRedeemPercent)

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

  if (!body.validFrom) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть дату початку дії політики'
    })
  }

  const validFrom = new Date(body.validFrom)

  if (Number.isNaN(validFrom.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректна дата початку дії політики'
    })
  }

  if (
    !Number.isFinite(rewardPercent) ||
    rewardPercent < 0 ||
    rewardPercent > 100
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Відсоток нарахування має бути від 0 до 100'
    })
  }

  if (
    !Number.isFinite(maxRedeemPercent) ||
    maxRedeemPercent < 0 ||
    maxRedeemPercent > 100
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Максимальна оплата бонусами має бути від 0 до 100%'
    })
  }

  if (
    minPurchaseAmount !== null &&
    (!Number.isFinite(minPurchaseAmount) || minPurchaseAmount < 0)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Мінімальна сума покупки не може бути від’ємною'
    })
  }

  if (
    minRedeemPoints !== null &&
    (!Number.isInteger(minRedeemPoints) || minRedeemPoints < 0)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Мінімальна кількість бонусів має бути цілим додатним числом'
    })
  }

  if (
    !Number.isInteger(activationDelayDays) ||
    activationDelayDays < 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Затримка активації має бути цілим числом днів'
    })
  }

  if (
    expirationDays !== null &&
    (!Number.isInteger(expirationDays) || expirationDays <= 0)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Строк дії бонусів має бути цілим числом більше 0'
    })
  }

  const policy = await prisma.$transaction(async (tx) => {
    // Політика, яка діяла безпосередньо перед новою
    const previousPolicy = await tx.bonusPolicy.findFirst({
      where: {
        validFrom: {
          lt: validFrom
        }
      },
      orderBy: {
        validFrom: 'desc'
      }
    })

    // Наступна вже запланована політика
    const nextPolicy = await tx.bonusPolicy.findFirst({
      where: {
        validFrom: {
          gt: validFrom
        }
      },
      orderBy: {
        validFrom: 'asc'
      }
    })

    // Забороняємо дві політики з однаковим validFrom
    const sameDatePolicy = await tx.bonusPolicy.findFirst({
      where: {
        validFrom
      }
    })

    if (sameDatePolicy) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Політика з такою датою початку вже існує'
      })
    }

    // Закриваємо попередню політику
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

    // Нова політика діє або безстроково,
    // або до наступної вже запланованої
    return await tx.bonusPolicy.create({
      data: {
        rewardPercent,
        maxRedeemPercent,
        minPurchaseAmount,
        minRedeemPoints,
        activationDelayDays,
        expirationDays,

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
  })

  return {
    success: true,
    policy
  }
})