import prisma from '../../utils/prisma'
import {
  normalizePhone,
  isValidUkrainianPhone
} from '../../utils/normalizePhone'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.phone || typeof body.phone !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Введіть номер телефону'
    })
  }

  if (!isValidUkrainianPhone(body.phone)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний номер телефону'
    })
  }

  const phone = normalizePhone(body.phone)

  const customer = await prisma.customer.findFirst({
    where: {
      phone,
      active: true,
      deletedAt: null,
      loyaltyActive: true
    },
    select: {
      id: true,
      name: true,
      cardToken: true
    }
  })

  if (!customer || !customer.cardToken) {
    throw createError({
      statusCode: 404,
      statusMessage:
        'Активну бонусну картку для цього номера не знайдено'
    })
  }

  return {
    success: true,

    customer: {
      name: customer.name
    },

    cardToken: customer.cardToken
  }
})