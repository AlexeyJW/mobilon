

import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = event.method
  
  // Конвертуємо ID в число
  const idNumber = parseInt(id)
  
  if (isNaN(idNumber)) {
    return {
      success: false,
      message: 'Невірний ID товару'
    }
  }
  
  console.log(`[API] ${method} /api/purchases/${idNumber}`)
  
  try {
    // DELETE
    if (method === 'DELETE') {
      const existingItem = await prisma.purchaseItem.findUnique({
        where: { id: idNumber }
      })
      
      if (!existingItem) {
        return {
          success: false,
          message: 'Товар не знайдено'
        }
      }
      
      await prisma.purchaseItem.delete({
        where: { id: idNumber }
      })
      
      return {
        success: true,
        message: 'Товар успішно видалено'
      }
    }
    
    // GET
    if (method === 'GET') {
      const item = await prisma.purchaseItem.findUnique({
        where: { id: idNumber }
      })
      
      if (!item) {
        return {
          success: false,
          message: 'Товар не знайдено'
        }
      }
      
      return item
    }
    
    // PUT
    if (method === 'PUT') {
      const body = await readBody(event)
      
      const item = await prisma.purchaseItem.update({
        where: { id: idNumber },
        data: {
          name: body.name,
          quantity: body.quantity || 1,
          supplier: body.supplier || null,
          note: body.note || null
        }
      })
      
      return item
    }
    
  } catch (error) {
    console.error('[API] Помилка:', error)
    return {
      success: false,
      message: error.message || 'Помилка виконання запиту'
    }
  }
})