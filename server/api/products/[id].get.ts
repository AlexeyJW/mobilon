import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!id || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний ID товару'
    })
  }

  const product = await prisma.product.findUnique({
    where: {
      id
    },
    include: {
      brandRef: true,
      categoryRef: true,

      specifications: {
        include: {
          specification: true,
          option: true
        },
        orderBy: {
          specification: {
            sortOrder: 'asc'
          }
        }
      }
    }
  })

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Товар не знайдено'
    })
  }

  return product
})