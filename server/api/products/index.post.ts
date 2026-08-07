import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  console.log('BODY =', body)

  await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      shortDescription: body.shortDescription,

      brand: body.brand,
      category: body.category,

      description: body.description,

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