import prisma from '../../../../utils/prisma'
import type { FindProductsInput } from './schema'
import { normalizeQuery } from './normalizeQuery'
export async function findProducts(input: FindProductsInput) {

 

 const query = normalizeQuery(input.query)

console.log('Normalized:', query)

const products = await prisma.product.findMany({
  where: {
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
  take: 5
})

return products
}