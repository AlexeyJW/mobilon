import prisma from '../../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const categoryId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!categoryId || Number.isNaN(categoryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний ID категорії'
    })
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId
    }
  })

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Категорію не знайдено'
    })
  }

  /*
    Очікуємо:

    {
      specifications: [
        {
          specificationId: 1,
          required: false,
          sortOrder: 0
        }
      ]
    }
  */

  const specifications = Array.isArray(body.specifications)
    ? body.specifications
    : []

  const specificationIds = specifications
    .map((item: any) => Number(item.specificationId))
    .filter((id: number) => !Number.isNaN(id))

  // Перевіряємо, що характеристики реально існують

  if (specificationIds.length) {
    const existingSpecifications =
      await prisma.specification.findMany({
        where: {
          id: {
            in: specificationIds
          }
        },
        select: {
          id: true
        }
      })

    if (
      existingSpecifications.length !==
      new Set(specificationIds).size
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Одна або декілька характеристик не існують'
      })
    }
  }

  return prisma.$transaction(async (tx) => {
    /*
      Найпростіша синхронізація:
      видаляємо старі зв'язки категорії
      та створюємо актуальні.
    */

    await tx.categorySpecification.deleteMany({
      where: {
        categoryId
      }
    })

    if (specifications.length) {
      await tx.categorySpecification.createMany({
        data: specifications.map(
          (item: any, index: number) => ({
            categoryId,

            specificationId:
              Number(item.specificationId),

            required:
              Boolean(item.required),

            sortOrder:
              item.sortOrder !== undefined
                ? Number(item.sortOrder)
                : index
          })
        )
      })
    }

    return tx.category.findUnique({
      where: {
        id: categoryId
      },

      include: {
        specifications: {
          orderBy: {
            sortOrder: 'asc'
          },

          include: {
            specification: {
              include: {
                options: {
                  orderBy: {
                    sortOrder: 'asc'
                  }
                }
              }
            }
          }
        }
      }
    })
  })
})