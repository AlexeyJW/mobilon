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

  const services = await prisma.service.findMany({
    where: {
      active: true
    },
    select: {
      id: true
    }
  })

  return [
    ...products.map(product => ({
      loc: `/products/${product.slug}`
    })),

    ...services.map(service => ({
      loc: `/services/${service.id}`
    }))
  ]
})