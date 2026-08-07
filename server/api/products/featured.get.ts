import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.product.findMany({
    where: {
      active: true,
      isFeatured: true
    },

    orderBy: [
      {
        sortOrder: 'asc'
      },
      {
        updatedAt: 'desc'
      }
    ]
  })
})