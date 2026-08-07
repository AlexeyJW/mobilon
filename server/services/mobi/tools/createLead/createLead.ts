import prisma from '../../../../utils/prisma'
import type { CreateLeadInput } from './schema'
import { formatLead } from '../../lead/formatLead'
import { sendTelegramMessage } from '../../../../utils/telegram'


export async function createLead(input: CreateLeadInput) {
  let product = null
  try {
   
    // якщо productId передали — перевіряємо його
    if (input.productId) {

       product = await prisma.product.findUnique({
        where: {
          id: input.productId
        }
      })

      if (!product) {
        return {
          success: false,
          reason: 'PRODUCT_NOT_FOUND'
        }
      }

    }

    const lead = await prisma.lead.create({
      data: input
    })
    if (product) {

      try {

        const message = formatLead(lead, product)

        await sendTelegramMessage(message)

      } catch (e) {

        console.error('Telegram error', e)

      }

    }

  } catch (error) {

    console.error(error)

    return {
      success: false,
      reason: 'UNKNOWN_ERROR'
    }

  }

}