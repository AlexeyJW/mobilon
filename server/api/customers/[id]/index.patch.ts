import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  const body = await readBody(event)

 

  const updatedRequest = await prisma.customer.update({
    where: {
      id
    },
    data: {
      
       notes: body.notes,
    }
  })

  return updatedRequest
})