import prisma from '../../../utils/prisma'

export default defineEventHandler(async () => {
  return prisma.category.findMany({
    orderBy: [
      {
        sortOrder: 'asc'
      },
      {
        name: 'asc'
      }
    ],

    include: {
      parent: true,

      children: {
        orderBy: {
          sortOrder: 'asc'
        }
      },

      specifications: {
        orderBy: {
          sortOrder: 'asc'
        },

        include: {
          specification: {
            include: {
              options: {
                orderBy: {
                  sortOrder: 'asc'
                }
              }
            }
          }
        }
      },

      _count: {
        select: {
          products: true
        }
      }
    }
  })
})