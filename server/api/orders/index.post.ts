import prisma from '../../utils/prisma'
import { sendTelegramMessage } from '../../utils/telegram'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const order = await prisma.order.create({
    data: {
      customer: body.customer,
      phone: body.phone,

      productId: body.productId,
      productName: body.productName,

      quantity: body.quantity,

      comment: body.comment,

      status: 'new'
    }
  })
  try {
  await sendTelegramMessage(`
🛒 <b>Нове замовлення</b>

👤 <b>Клієнт:</b> ${order.customer}

☎️ <b>Телефон:</b> ${order.phone}

📦 <b>Товар:</b> ${order.productName}

🔢 <b>Кількість:</b> ${order.quantity}

💬 <b>Коментар:</b>
${order.comment ?? '-'}
`)
} catch (error) {
  console.error('Telegram error:', error)
}
  return {
    success: true,
    order
  }
})