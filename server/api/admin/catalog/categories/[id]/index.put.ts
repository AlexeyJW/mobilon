// server/api/admin/catalog/categories/[id].put.ts

import prisma from '../../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Некоректний ID категорії'
    })
  }

  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const slug = String(body?.slug || '').trim()

  const parentId =
    body?.parentId === null ||
    body?.parentId === undefined ||
    body?.parentId === ''
      ? null
      : Number(body.parentId)

  const sortOrder =
    body?.sortOrder === undefined ||
    body?.sortOrder === null ||
    body?.sortOrder === ''
      ? 0
      : Number(body.sortOrder)

  const active =
    body?.active === undefined
      ? true
      : Boolean(body.active)

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Вкажіть назву категорії'
    })
  }

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Вкажіть slug категорії'
    })
  }

  if (
    parentId !== null &&
    (!Number.isInteger(parentId) || parentId <= 0)
  ) {
    throw createError({
      statusCode: 400,
      message: 'Некоректна батьківська категорія'
    })
  }

  if (!Number.isFinite(sortOrder)) {
    throw createError({
      statusCode: 400,
      message: 'Некоректний порядок сортування'
    })
  }

  const existingCategory =
    await prisma.category.findUnique({
      where: {
        id
      }
    })

  if (!existingCategory) {
    throw createError({
      statusCode: 404,
      message: 'Категорію не знайдено'
    })
  }

  /*
    Категорія не може бути батьківською
    сама для себе
  */
  if (parentId === id) {
    throw createError({
      statusCode: 400,
      message:
        'Категорія не може бути батьківською сама для себе'
    })
  }

  /*
    Перевіряємо, чи існує parentId
  */
  if (parentId !== null) {
    const parent =
      await prisma.category.findUnique({
        where: {
          id: parentId
        }
      })

    if (!parent) {
      throw createError({
        statusCode: 400,
        message:
          'Батьківську категорію не знайдено'
      })
    }
  }

  /*
    Перевіряємо унікальність slug
  */
  const slugExists =
    await prisma.category.findFirst({
      where: {
        slug,
        id: {
          not: id
        }
      }
    })

  if (slugExists) {
    throw createError({
      statusCode: 409,
      message:
        'Категорія з таким slug вже існує'
    })
  }

  try {
    const category =
      await prisma.category.update({
        where: {
          id
        },

        data: {
          name,
          slug,
          parentId,
          sortOrder,
          active
        },

        include: {
          parent: true,

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
          },

          _count: {
            select: {
              products: true
            }
          }
        }
      })

    return category
  }
  catch (error: any) {
    console.error(
      'CATEGORY UPDATE ERROR:',
      error
    )

    throw createError({
      statusCode: 500,
      message:
        'Не вдалося оновити категорію'
    })
  }
})