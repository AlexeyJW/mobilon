// Замініть весь вміст на це
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  // Перевірка 1: чи існує prisma
  console.log('Prisma exists?', !!prisma)
  console.log('Prisma.request exists?', !!prisma?.request)
  
  // Перевірка 2: спроба підключення
  try {
    await prisma.$connect()
    console.log('Connected to database')
  } catch (e) {
    console.error('Connection failed:', e)
  }
  
  // Перевірка 3: простий count
  try {
    const count = await prisma.request.count()
    return { success: true, count, message: 'Prisma works!' }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      prismaExists: !!prisma,
      hasRequestMethod: !!prisma?.request
    }
  }
})