import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const customerId = Number(event.context.params?.id)

  const body = await readBody(event)

  const amount = Number(body.amount)
  const reason = body.reason

  await prisma.bonusTransaction.create({
    data: {
      customerId,
      amount,
      reason
    }
  })

  await prisma.customer.update({
    where: {
      id: customerId
    },

    data: {
      points: {
        increment: amount
      }
    }
  })

  return {
    success: true
  }
})