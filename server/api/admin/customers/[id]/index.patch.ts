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

  const body = await readBody(event)

  const customer = await prisma.customer.findUnique({
    where: {
      id
    },

    select: {
      id: true
    }
  })

  if (!customer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Клієнта не знайдено'
    })
  }

  /* ==================================================
     DATA TO UPDATE
  ================================================== */

  const data: {
    notes?: string | null
    loyaltyActive?: boolean
  } = {}

  /* ---------- NOTES ---------- */

  if ('notes' in body) {
    if (
      body.notes !== null &&
      typeof body.notes !== 'string'
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Некоректне значення нотаток'
      })
    }

    data.notes =
      typeof body.notes === 'string'
        ? body.notes.trim() || null
        : null
  }

  /* ---------- LOYALTY ---------- */

  if ('loyaltyActive' in body) {
    if (typeof body.loyaltyActive !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Некоректне значення бонусної програми'
      })
    }

    data.loyaltyActive = body.loyaltyActive
  }

  /* ---------- NOTHING TO UPDATE ---------- */

  if (Object.keys(data).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Немає даних для оновлення'
    })
  }

  /* ==================================================
     UPDATE CUSTOMER
  ================================================== */

  const updatedCustomer = await prisma.customer.update({
    where: {
      id
    },

    data
  })

  return {
    success: true,
    customer: updatedCustomer
  }
})