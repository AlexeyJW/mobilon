import prisma from '../../../../utils/prisma'
import type { CreateLeadInput } from './schema'
import { formatLead } from '../../lead/formatLead'
import { sendTelegramMessage } from '../../../../utils/telegram'

export async function createLead(input: CreateLeadInput) {
  try {
    // 1. Знаходимо товар
    const product = await prisma.product.findUnique({
      where: {
        id: input.productId
      }
    })

    if (!product) {
      return {
        success: false,
        reason: 'PRODUCT_NOT_FOUND',
        productId: input.productId
      }
    }

    // 2. Створюємо заявку
    const lead = await prisma.lead.create({
      data: {
        customerName: input.customerName,
        phone: input.phone,
        city: input.city,
        comment: input.comment,
        productId: product.id
      }
    })

    // 3. Формуємо повідомлення
    const message = formatLead(lead, product)

    // 4. Відправляємо Telegram
    try {
      await sendTelegramMessage(message)

      return {
        success: true,
        leadId: lead.id,
        telegramSent: true
      }
    } catch (telegramError) {
      console.error(
        `Telegram failed for lead #${lead.id}:`,
        telegramError
      )

      return {
        success: true,
        leadId: lead.id,
        telegramSent: false,
        reason: 'TELEGRAM_SEND_FAILED'
      }
    }

  } catch (error) {
    console.error('createLead error:', error)

    return {
      success: false,
      reason: 'UNKNOWN_ERROR'
    }
  }
}