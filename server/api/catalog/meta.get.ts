import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    }),

    prisma.category.findMany({
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
        specifications: {
          where: {
            specification: {
              active: true
            }
          },
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
        }
      }
    })
  ])

  return {
    brands,
    categories
  }
})