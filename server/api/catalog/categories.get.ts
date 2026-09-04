// публічний API для отримання категорій товарів
import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.category.findMany({
    where: {
      active: true
    },

    orderBy: [
      {
        sortOrder: 'asc'
      },
      {
        name: 'asc'
      }
    ],

    include: {
      _count: {
        select: {
          products: {
            where: {
              active: true
            }
          }
        }
      }
    }
  })

  return categories
})