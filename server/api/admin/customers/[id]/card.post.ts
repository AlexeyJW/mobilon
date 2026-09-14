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

  if (customer.cardToken) {
    return {
      success: true,
      cardToken: customer.cardToken
    }
  }

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
    cardToken
  }
})