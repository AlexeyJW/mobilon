import prisma from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const services = await prisma.service.findMany({
    where: {
      active: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      image: true
    }
  })

  return {
    success: true,
    services
  }
})