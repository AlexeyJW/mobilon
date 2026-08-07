import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.product.findMany({
    where: {
      active: true,
      isPopular: true
    },

    orderBy: {
      updatedAt: 'desc'
    },

    take: 6,

    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      category: true,
      sellPrice: true,
      quantity: true,
      imageUrl: true
    }
  })
})