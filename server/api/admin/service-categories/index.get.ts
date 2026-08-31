
import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const categories = await prisma.serviceCategory.findMany({
    orderBy: [
      {
        sortOrder: 'asc'
      },
      {
        name: 'asc'
      }
    ],
    select: {
      id: true,
      name: true,
      sortOrder: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return {
    success: true,
    categories
  }
})