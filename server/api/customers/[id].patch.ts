import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const body = await readBody(event)

  const customer = await prisma.customer.update({
    where: {
      id
    },

    data: {
      notes: body.notes
    }
  })

  return customer
})