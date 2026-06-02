import prisma from '../utils/prisma'

export default defineEventHandler(async () => {

  const customers = await prisma.customer.findMany({

    include: {
      requests: true
    },

    orderBy: {
      visits: 'desc'
    }

  })

  return customers

})