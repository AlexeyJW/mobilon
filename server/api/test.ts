import prisma from '../utils/prisma'

export default defineEventHandler(async () => {

  const requests = await prisma.request.findMany({
    include: {
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return requests

})
