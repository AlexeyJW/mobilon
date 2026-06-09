import prisma from '../utils/prisma'
import { resend } from '../utils/resend'
import { z } from 'zod'

const requestSchema = z.object({
  name: z.string().min(2, 'Імʼя закоротке'),
  phone: z.string().min(5, 'Телефон закороткий'),
  description: z.string().min(5, 'Опишіть проблему')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    

    
    // validation
    const validatedData = requestSchema.parse(body)
console.log('VALIDATED:', validatedData)

    const customer = await prisma.customer.upsert({
  where: {
    phone: validatedData.phone
  },

  update: {
    visits: {
      increment: 1
    },
    points: {
      increment: 10
    },
    name: validatedData.name
  },

  create: {
    name: validatedData.name,
    phone: validatedData.phone,
    visits: 1,
    points: 10
  }
})
console.log('CUSTOMER:', customer)
    const request = await prisma.request.create({
      data:{
    ...validatedData,

    customerId: customer.id
  }
    })

    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: 'kononenko.jw@gmail.com',
      subject: 'Нова заявка',
      html: `
        <h2>Нова заявка</h2>
        <p><b>Імʼя:</b> ${validatedData.name}</p>
        <p><b>Телефон:</b> ${validatedData.phone}</p>
        <p><b>Опис:</b> ${validatedData.description}</p>
      `
    })

    return {
      success: true
    }

  } catch (error) {
    console.error(error)

    throw createError({
      statusCode: 400,
      statusMessage: 'Помилка валідації або відправки'
    })
  }
})