import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const services = await prisma.service.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return {
    success: true,
    services
  }
})