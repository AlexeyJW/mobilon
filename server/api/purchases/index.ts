import prisma from '../../utils/prisma'

export default defineEventHandler (async (event)=>{
    if (event.method === 'GET') {
        return await prisma.purchaseItem.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
    }
    if (event.method === 'POST') {
        const body = await readBody(event)
        const item = await prisma.purchaseItem.create({
            data: {
                name: body.name,
                quantity: body.quantity||1,
                supplier: body.supplier || 'null',
                note: body.note || 'null',
            }

        }) 
        return item
    }
})