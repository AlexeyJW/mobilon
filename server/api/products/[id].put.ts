import prisma from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!id || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний ID товару'
    })
  }

  const brand = body.brand
    ? await prisma.brand.findFirst({
        where: {
          name: body.brand
        }
      })
    : null

  const category = body.category
    ? await prisma.category.findFirst({
        where: {
          name: body.category
        },
        include: {
          specifications: {
            include: {
              specification: {
                include: {
                  options: true
                }
              }
            }
          }
        }
      })
    : null

  return prisma.$transaction(async (tx) => {
    /*
    ========================================
    1. ОНОВЛЮЄМО PRODUCT
    ========================================
    */

    const product = await tx.product.update({
      where: {
        id
      },

      data: {
        name: body.name,
        slug: body.slug,

        shortDescription: body.shortDescription,
        description: body.description,

        brand: body.brand,
        brandId: brand?.id ?? null,

        category: body.category,
        categoryId: category?.id ?? null,

        buyPrice: Number(body.buyPrice || 0),
        sellPrice: Number(body.sellPrice || 0),

        quantity: Number(body.quantity || 0),

        imageUrl: body.imageUrl || null,
        imageId: body.imageId || null,

        featuredOrder:
          body.featuredOrder !== null &&
          body.featuredOrder !== undefined
            ? Number(body.featuredOrder)
            : null,

        sortOrder: Number(body.sortOrder || 0),

        isPopular: Boolean(body.isPopular),
        isFeatured: Boolean(body.isFeatured),
        isNew: Boolean(body.isNew),
        isSale: Boolean(body.isSale),

        active: Boolean(body.active)
      }
    })

    /*
    ========================================
    2. ХАРАКТЕРИСТИКИ
    ========================================
    */

    const incomingSpecifications =
      body.specifications || {}

    /*
      Видаляємо старі характеристики.

      Потім створюємо актуальні заново.
      Для адмінки це зараз найпростіший
      і найбезпечніший варіант.
    */

    await tx.productSpecification.deleteMany({
      where: {
        productId: id
      }
    })

    /*
      Якщо категорії немає або для неї
      немає характеристик — просто повертаємо товар.
    */

    if (
      !category ||
      !category.specifications.length
    ) {
      return product
    }

    /*
    ========================================
    3. СТВОРЮЄМО PRODUCT SPECIFICATIONS
    ========================================
    */

    for (
      const categorySpecification
      of category.specifications
    ) {
      const specification =
        categorySpecification.specification

      const value =
        incomingSpecifications[specification.key]

      /*
        Порожні TEXT / NUMBER / SELECT
        не записуємо в БД.
      */

      if (
        value === undefined ||
        value === null ||
        value === ''
      ) {
        /*
          BOOLEAN false є нормальним значенням,
          тому його пропускати не можна.
        */

        if (specification.type !== 'BOOLEAN') {
          continue
        }
      }

      /*
      ========================================
      TEXT
      ========================================
      */

      if (specification.type === 'TEXT') {
        await tx.productSpecification.create({
          data: {
            productId: id,
            specificationId: specification.id,

            valueText: String(value)
          }
        })

        continue
      }

      /*
      ========================================
      NUMBER
      ========================================
      */

      if (specification.type === 'NUMBER') {
        const numberValue = Number(value)

        if (Number.isNaN(numberValue)) {
          continue
        }

        await tx.productSpecification.create({
          data: {
            productId: id,
            specificationId: specification.id,

            valueNumber: numberValue
          }
        })

        continue
      }

      /*
      ========================================
      BOOLEAN
      ========================================
      */

      if (specification.type === 'BOOLEAN') {
        await tx.productSpecification.create({
          data: {
            productId: id,
            specificationId: specification.id,

            valueBoolean: Boolean(value)
          }
        })

        continue
      }

      /*
      ========================================
      SELECT
      ========================================
      */

      if (specification.type === 'SELECT') {
        const option =
          specification.options.find(
            option => option.value === value
          )

        if (!option) {
          continue
        }

        await tx.productSpecification.create({
          data: {
            productId: id,
            specificationId: specification.id,

            optionId: option.id
          }
        })

        continue
      }
    }

    return tx.product.findUnique({
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
          }
        }
      }
    })
  })
})