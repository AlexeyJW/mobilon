import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.storePhoto.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      sortOrder: 'asc'
    }
  })
})