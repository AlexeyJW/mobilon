

import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // GET - отримати один товар
  if (event.method === 'GET') {
    const item = await prisma.purchaseItem.findUnique({
      where: { id }
    })
    
    if (!item) {
      throw createError({
        statusCode: 404,
        message: 'Товар не знайдено'
      })
    }
    
    return item
  }
  
  // PUT - оновити товар
  if (event.method === 'PUT') {
    const body = await readBody(event)
    
    const item = await prisma.purchaseItem.update({
      where: { id },
      data: {
        name: body.name,
        quantity: body.quantity || 1,
        supplier: body.supplier || null,
        note: body.note || null
      }
    })
    
    return item
  }
  
  // DELETE - видалити товар
  if (event.method === 'DELETE') {
    await prisma.purchaseItem.delete({
      where: { id }
    })
    
    return { success: true }
  }
})
