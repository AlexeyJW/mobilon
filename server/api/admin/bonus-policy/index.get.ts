import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const now = new Date()

  // Поточна активна політика
  const currentPolicy = await prisma.bonusPolicy.findFirst({
    where: {
      validFrom: {
        lte: now
      },
      OR: [
        {
          validTo: null
        },
        {
          validTo: {
            gt: now
          }
        }
      ]
    },

    orderBy: {
      validFrom: 'desc'
    }
  })

  // Уся історія політик
  const policies = await prisma.bonusPolicy.findMany({
    orderBy: {
      validFrom: 'desc'
    }
  })

  return {
    success: true,
    currentPolicy,
    policies
  }
})