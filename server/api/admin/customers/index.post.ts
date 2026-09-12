import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  const name = String(body.name || '').trim()
  const phone = String(body.phone || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть ім’я клієнта'
    })
  }

  if (!phone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть номер телефону'
    })
  }

  const existingCustomer = await prisma.customer.findUnique({
    where: {
      phone
    }
  })

  if (existingCustomer) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Клієнт з таким номером телефону вже існує'
    })
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      phone
    }
  })

  return {
    success: true,
    customer
  }
})