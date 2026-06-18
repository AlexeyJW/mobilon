import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  const body = await readBody(event)

  console.log('PATCH ID:', id)
  console.log('PATCH BODY:', body)

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