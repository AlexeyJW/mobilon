import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'
import {
  normalizePhone,
  isValidUkrainianPhone
} from '../../../utils/normalizePhone'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  const name = String(body.name || '').trim()
  const rawPhone = String(body.phone || '').trim()
const loyaltyActive = body.loyaltyActive === true

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть ім’я клієнта'
    })
  }

  if (!rawPhone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть номер телефону'
    })
  }

  if (!isValidUkrainianPhone(rawPhone)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть коректний номер телефону'
    })
  }

  const phone = normalizePhone(rawPhone)

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
    phone,
    loyaltyActive
  }
})

  return {
    success: true,
    customer
  }
})