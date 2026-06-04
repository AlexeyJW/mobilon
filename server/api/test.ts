import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  try {
    const requests = await prisma.request.findMany()

    return requests
  } catch (error) {
    console.error('API TEST ERROR:', error)

    return {
      error: String(error)
    }
  }
})