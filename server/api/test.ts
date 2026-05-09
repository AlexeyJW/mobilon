import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const requests = await prisma.request.findMany()

  return requests
})