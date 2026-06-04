// api/check-schema.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  // 1. Отримати перший запит з полями
  const firstRequest = await prisma.request.findFirst()
  
  // 2. Отримати першого клієнта
  const firstCustomer = await prisma.customer.findFirst()
  
  // 3. Спробувати включити customer
  const requestWithCustomer = await prisma.request.findFirst({
    include: { customer: true }
  })
  
  // 4. Перевірити, чи є запити без customerId
  const requestsWithoutCustomer = await prisma.request.findMany({
    where: { customerId: null }
  })
  
  // 5. Перевірити зв'язок через SQL
  const rawJoin = await prisma.$queryRaw`
    SELECT r.*, c.* 
    FROM "Request" r 
    LEFT JOIN "Customer" c ON r."customerId" = c.id 
    LIMIT 1
  `
  
  return {
    firstRequest,
    firstCustomer,
    requestWithCustomer,
    requestsWithoutCustomerCount: requestsWithoutCustomer.length,
    rawJoin,
    columnNames: {
      request: Object.keys(firstRequest || {}),
      customer: Object.keys(firstCustomer || {})
    }
  }
})