import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.serviceCategory.findMany({
    where: {
      active: true,
      services: {
        some: {
          active: true
        }
      }
    },
    orderBy: {
      sortOrder: 'asc'
    },
    select: {
      id: true,
      name: true,
      services: {
        where: {
          active: true
        },
        orderBy: {
          sortOrder: 'asc'
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          priceFrom: true
        }
      }
    }
  })

  return {
    success: true,
    categories
  }
})