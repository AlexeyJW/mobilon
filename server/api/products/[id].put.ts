import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  return prisma.product.update({
    where: {
      id
    },

    data: {
      name: body.name,
      slug: body.slug,

      shortDescription: body.shortDescription,
      description: body.description,

      brand: body.brand,
      category: body.category,

      buyPrice: body.buyPrice,
      sellPrice: body.sellPrice,

      quantity: body.quantity,

      imageUrl: body.imageUrl,
      imageId: body.imageId,

      featuredOrder: body.featuredOrder,

      isPopular: body.isPopular,
      isFeatured: body.isFeatured,
      isNew: body.isNew,
      isSale: body.isSale,

      active: body.active
    }
  })
})