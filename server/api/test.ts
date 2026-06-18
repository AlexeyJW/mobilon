import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {

  const query = getQuery(event)
  const status = query.status?.toString()

  const requests = await prisma.request.findMany({

    where: status
      ? {
          status
        }
      : undefined,

    include: {
      customer: true
    },

    orderBy: {
      createdAt: 'desc'
    }

  })

  return requests

})