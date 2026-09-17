import crypto from 'node:crypto'

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
    where: { id }
  })

  if (!customer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Клієнта не знайдено'
    })
  }

  /*
   * Якщо токен уже існує —
   * не створюємо новий.
   *
   * Але обов'язково активуємо
   * бонусну програму.
   */
  if (customer.cardToken) {
    if (!customer.loyaltyActive) {
      await prisma.customer.update({
        where: { id },
        data: {
          loyaltyActive: true
        }
      })
    }

    return {
      success: true,
      cardToken: customer.cardToken,
      loyaltyActive: true
    }
  }

  /*
   * Якщо картки ще немає —
   * створюємо токен та активуємо її.
   */
  const cardToken =
    crypto.randomBytes(24).toString('hex')

  await prisma.customer.update({
    where: { id },
    data: {
      cardToken,
      loyaltyActive: true
    }
  })

  return {
    success: true,
    cardToken,
    loyaltyActive: true
  }
})