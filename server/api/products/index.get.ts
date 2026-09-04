import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async () => {
  return prisma.product.findMany({
    // where: {
    //   // active: false
    // },

    orderBy: [
      {
        featuredOrder: 'asc'
      },
      {
        createdAt: 'desc'
      }
    ],

    include: {
      specifications: {
        include: {
          specification: true,
          option: true
        }
      }
    }
  })
})