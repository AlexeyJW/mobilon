import prisma from '../../../../utils/prisma'
import requireAdmin from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const customerId = Number(event.context.params?.id)

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний ID клієнта'
    })
  }

  const body = await readBody(event)

  const amount = Number(body.amount)
  const reason = String(body.reason || '').trim()

  if (!Number.isInteger(amount) || amount === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть коректну кількість бонусів'
    })
  }

  if (!reason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть причину коригування'
    })
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId
    },

    select: {
      id: true,
      active: true
    }
  })

  if (!customer || !customer.active) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Клієнта не знайдено'
    })
  }

  const transaction = await prisma.bonusTransaction.create({
    data: {
      customerId,
      amount,

      type: 'ADMIN_ADJUSTMENT',

      reason,
      description: reason
    }
  })

  return {
    success: true,
    transaction
  }
})