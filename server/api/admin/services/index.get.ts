import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const services = await prisma.service.findMany({
    orderBy: [
      {
        sortOrder: 'asc'
      },
      {
        createdAt: 'desc'
      }
    ],

    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      categoryId: true,
      priceFrom: true,
      sortOrder: true,
      active: true,
      createdAt: true,
      updatedAt: true,

      categoryRef: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return {
    success: true,
    services
  }
})