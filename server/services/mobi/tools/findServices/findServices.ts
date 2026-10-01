import prisma from '../../../../utils/prisma'
import type { FindServicesInput } from './schema'
import { normalizeQuery } from './normalizeQuery'

export async function findServices(input: FindServicesInput) {

 
  

 
  const query = normalizeQuery(input.query)



  const priceFilter: {
    gte?: number
    lte?: number
  } = {}

  if (input.minPrice && input.minPrice > 0) {
    priceFilter.gte = input.minPrice
  }

  if (input.maxPrice && input.maxPrice > 0) {
    priceFilter.lte = input.maxPrice
  }

  const services = await prisma.service.findMany({
    where: {
      active: true,

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
              description: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              categoryRef: {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            }
          ]
        },

        ...(Object.keys(priceFilter).length > 0
          ? [
              {
                price: priceFilter
              }
            ]
          : [])
      ]
    },

    include: {
      categoryRef: {
        select: {
          id: true,
          name: true
        }
      }
    },

    orderBy: {
      name: 'asc'
    },

    take: 5
  })



  return services
}