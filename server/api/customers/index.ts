import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {

  const query = getQuery(event)
  const search = query.search?.toString() || ''

  const customers = await prisma.customer.findMany({

    where: search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              phone: {
                contains: search
              }
            }
          ]
        }
      : undefined,

    include: {
      requests: true
    },

    orderBy: {
      visits: 'desc'
    }

  })

  return customers

})