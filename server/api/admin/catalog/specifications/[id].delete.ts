// server/api/admin/catalog/specifications/[id].delete.ts

import prisma from '../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(
    getRouterParam(event, 'id')
  )

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw createError({
      statusCode: 400,
      message:
        'Некоректний ID характеристики'
    })
  }

  const specification =
    await prisma.specification.findUnique({
      where: { id },

      include: {
        _count: {
          select: {
            products: true,
            categories: true
          }
        }
      }
    })

  if (!specification) {
    throw createError({
      statusCode: 404,
      message:
        'Характеристику не знайдено'
    })
  }

  const productUsage =
    specification._count.products

  const categoryUsage =
    specification._count.categories

  if (
    productUsage > 0 ||
    categoryUsage > 0
  ) {
    throw createError({
      statusCode: 409,
      message:
        `Не можна видалити характеристику "${specification.name}", ` +
        `оскільки вона використовується: ` +
        `${productUsage} товар(ів), ${categoryUsage} категорій`
    })
  }

  try {
    await prisma.specification.delete({
      where: { id }
    })

    return {
      success: true
    }
  }
  catch (error: any) {
    console.error(
      'SPECIFICATION DELETE ERROR:',
      error
    )

    throw createError({
      statusCode: 500,
      message:
        'Не вдалося видалити характеристику'
    })
  }
})