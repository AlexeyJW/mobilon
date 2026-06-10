import prisma from '../../utils/prisma'


export default defineEventHandler(async (event) => {

  const id = Number(event.context.params.id)

  const customer = await prisma.customer.findUnique({

    where: {
      id
    },

    include: {
      requests: true
    }

  })

  return customer

})