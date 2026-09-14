import prisma from '../../utils/prisma'

function normalizePhone(phone: string) {
  let value = phone.replace(/\D/g, '')

  // 0981234567 -> 380981234567
  if (value.length === 10 && value.startsWith('0')) {
    value = `38${value}`
  }

  // 80981234567 -> 380981234567
  if (value.length === 11 && value.startsWith('80')) {
    value = `3${value}`
  }

  return value
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.phone || typeof body.phone !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Введіть номер телефону'
    })
  }

  const phone = normalizePhone(body.phone)

  if (!/^380\d{9}$/.test(phone)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний номер телефону'
    })
  }

  /*
   * У базі номер може бути записаний як:
   * +380981234567
   * 380981234567
   * 0981234567
   *
   * Тому порівнюємо кілька поширених форматів.
   */
  const localPhone = `0${phone.slice(3)}`
  const internationalPhone = `+${phone}`

  const customer = await prisma.customer.findFirst({
    where: {
      active: true,
      deletedAt: null,
      loyaltyActive: true,

      OR: [
        { phone },
        { phone: internationalPhone },
        { phone: localPhone }
      ]
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