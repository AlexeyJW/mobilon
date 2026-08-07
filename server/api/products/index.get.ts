import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async () => {
  return prisma.product.findMany({
    where: {
      active: true
    },

    orderBy: [
      {
        featuredOrder: 'asc'
      },
      {
        createdAt: 'desc'
      }
    ]
  })
})