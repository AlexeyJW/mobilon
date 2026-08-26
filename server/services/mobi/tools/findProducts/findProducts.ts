import prisma from '../../../../utils/prisma'
import type { FindProductsInput } from './schema'
import { normalizeQuery } from './normalizeQuery'

export async function findProducts(input: FindProductsInput) {
  const query = normalizeQuery(input.query)

  console.log('Original query:', input.query)
  console.log('Normalized query:', query)
  console.log('Price range:', input.minPrice, input.maxPrice)

  const priceFilter: {
    gte?: number
    lte?: number
  } = {}

  // 0 означає, що бюджет не заданий
  if (input.minPrice && input.minPrice > 0) {
    priceFilter.gte = input.minPrice
  }

  if (input.maxPrice && input.maxPrice > 0) {
    priceFilter.lte = input.maxPrice
  }

  const products = await prisma.product.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              brand: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              category: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        },

        ...(Object.keys(priceFilter).length > 0
          ? [
              {
                sellPrice: priceFilter
              }
            ]
          : []),
           ...(input.excludeProductIds?.length
        ? [
            {
              id: {
                notIn: input.excludeProductIds
              }
            }
          ]
        : [])
    ]
  },

    orderBy: {
      sortOrder: 'asc'
    },

    take: 5
  })

  console.log('Products found:', products.length)

  return products
}