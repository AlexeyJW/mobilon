import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  const body = await readBody(event)

  const updatedRequest = await prisma.request.update({
    where: {
      id
    },
    data: {
      status: body.status
    }
  })

  return updatedRequest
})