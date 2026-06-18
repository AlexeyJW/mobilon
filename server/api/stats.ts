import prisma from '../utils/prisma'

export default defineEventHandler(async () => {

  const [
    customers,
    requests,
    newRequests,
    inProgressRequests,
    doneRequests
  ] = await Promise.all([

    prisma.customer.count(),

    prisma.request.count(),

    prisma.request.count({
      where: {
        status: 'new'
      }
    }),

    prisma.request.count({
      where: {
        status: 'in_progress'
      }
    }),

    prisma.request.count({
      where: {
        status: 'done'
      }
    })

  ])

  return {
    customers,
    requests,
    newRequests,
    inProgressRequests,
    doneRequests
  }

})