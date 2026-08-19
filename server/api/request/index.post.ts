import prisma from '../../utils/prisma'
import { z } from 'zod'

const config = useRuntimeConfig()


const requestSchema = z.object({
  name: z.string().min(2, 'Імʼя закоротке'),
  phone: z.string().min(5, 'Телефон закороткий'),
  description: z.string().min(5, 'Опишіть проблему')
})

export default defineEventHandler(async (event) => {
  console.log('🔥 API CALLED:', event.method, event.path)

  try {
    const body = await readBody(event)

    

    const validatedData = requestSchema.parse(body)

   

    // 1. Знаходимо або створюємо клієнта
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

    

    // 2. Зберігаємо заявку
    const request = await prisma.request.create({
      data: {
        ...validatedData,
        customerId: customer.id
      }
    })

   

    // 3. Відправляємо повідомлення в Telegram
    const config = useRuntimeConfig()

    if (!config.telegramBotToken || !config.telegramChatId) {
      console.error('❌ Telegram config is missing')

      throw createError({
        statusCode: 500,
        statusMessage: 'Telegram не налаштований'
      })
    }

    const telegramMessage = [
      '🔔 НОВА ЗАЯВКА З САЙТУ MOBILON',
      '',
      `👤 Імʼя: ${validatedData.name}`,
      `📞 Телефон: ${validatedData.phone}`,
      `💬 Опис: ${validatedData.description}`,
      '',
      `🆔 Заявка #${request.id}`,
      `👤 Клієнт #${customer.id}`,
      '',
      `🕐 ${new Date().toLocaleString('uk-UA')}`
    ].join('\n')

    await $fetch(
      `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
      {
        method: 'POST',

        body: {
          chat_id: config.telegramChatId,
          text: telegramMessage
        }
      }
    )

   

    return {
      success: true,
      requestId: request.id
    }

  } catch (error: any) {
    console.error('❌ REQUEST ERROR:', error)

    throw createError({
      statusCode: error?.statusCode || 400,
      statusMessage:
        error?.statusMessage ||
        error?.message ||
        'Помилка створення заявки'
    })
  }
})