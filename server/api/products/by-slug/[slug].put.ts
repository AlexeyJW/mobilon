import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const body = await readBody(event)

  const product = await prisma.product.findUnique({
    where: {
      slug
    }
  })

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found'
    })
  }

  const updatedProduct = await prisma.product.update({
    where: {
      slug
    },
    data: {
      name: body.name,
      brand: body.brand,
      category: body.category,
      shortDescription: body.shortDescription,
      description: body.description,

      buyPrice: Number(body.buyPrice),
      sellPrice: Number(body.sellPrice),
      quantity: Number(body.quantity),

      imageUrl: body.imageUrl,
      imageId: body.imageId,

      isFeatured: Boolean(body.isFeatured),
      isPopular: Boolean(body.isPopular),
      isNew: Boolean(body.isNew),
      isSale: Boolean(body.isSale),

      active: Boolean(body.active),

      sortOrder: Number(body.sortOrder),
      featuredOrder:
        body.featuredOrder === null || body.featuredOrder === undefined
          ? null
          : Number(body.featuredOrder)
    }
  })

  return updatedProduct
})