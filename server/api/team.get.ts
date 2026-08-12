import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany({
    where: {
      active: true,
      showOnAbout: true
    },
    select: {
      id: true,
      name: true,
      role: true,
      photo: true,
      position: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return {
    success: true,
    users
  }
})