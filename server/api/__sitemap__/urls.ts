import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const products = await prisma.product.findMany({
    where: {
      quantity: {
        gt: 0
      }
    },
    select: {
      slug: true
    }
  })

  return products.map(product => ({
    loc: `/products/${product.slug}`
  }))
})