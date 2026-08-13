import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const categories = await prisma.serviceCategory.findMany({
    where: {
      active: true
    },
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true,
      active: true
    }
  })

  return {
    success: true,
    categories
  }
})