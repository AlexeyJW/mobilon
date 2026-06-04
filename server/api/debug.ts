// api/debug.ts
import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const results = {}
  
  try {
    // 1. Перевірка підключення
    results.connection = await prisma.$queryRaw`SELECT 1 as connected`
    
    // 2. Кількість запитів
    results.requestsCount = await prisma.request.count()
    
    // 3. Кількість клієнтів
    results.customersCount = await prisma.customer.count()
    
    // 4. Перші 5 запитів (без include)
    results.firstRequests = await prisma.request.findMany({
      take: 5,
      select: {
        id: true,
        description: true,
        customerId: true
      }
    })
    
    // 5. Спробуємо include на одному записі
    const oneRequest = await prisma.request.findFirst({
      include: { customer: true }
    })
    results.sampleWithInclude = oneRequest
    
    return results
    
  } catch (error) {
    return {
      error: {
        message: error.message,
        code: error.code,
        meta: error.meta
      }
    }
  }
})