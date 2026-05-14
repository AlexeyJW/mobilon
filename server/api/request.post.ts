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

    const request = await prisma.request.create({
      data: validatedData
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