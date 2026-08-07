import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  const order = await prisma.order.create({
    data: {
      customer: 'Тестовий клієнт',
      phone: '+380501112233',

      productId: 1,
      productName: 'Samsung A37',

      quantity: 2,

      comment: 'Тестова заявка',

      status: 'new'
    }
  })

  return order
})