import prisma from '../../../utils/prisma'

export default defineEventHandler(async () => {
  return prisma.specification.findMany({
    orderBy: [
      {
        sortOrder: 'asc'
      },
      {
        name: 'asc'
      }
    ],

    include: {
      options: {
        orderBy: {
          sortOrder: 'asc'
        }
      },

      categories: {
        include: {
          category: true
        },

        orderBy: {
          sortOrder: 'asc'
        }
      },

      _count: {
        select: {
          products: true,
          categories: true
        }
      }
    }
  })
})