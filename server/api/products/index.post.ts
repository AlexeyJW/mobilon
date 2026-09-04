import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

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
    1. СТВОРЮЄМО PRODUCT
    ========================================
    */

    const product = await tx.product.create({
      data: {
        name: body.name,
        slug: body.slug,

        shortDescription: body.shortDescription || null,
        description: body.description || null,

        brand: body.brand || '',
        brandId: brand?.id ?? null,

        category: body.category || '',
        categoryId: category?.id ?? null,

        buyPrice: Number(body.buyPrice || 0),
        sellPrice: Number(body.sellPrice || 0),

        quantity: Number(body.quantity || 0),

        imageUrl: body.imageUrl || null,
        imageId: body.imageId || null,

        isFeatured: Boolean(body.isFeatured),
        isPopular: Boolean(body.isPopular),
        isNew: Boolean(body.isNew),
        isSale: Boolean(body.isSale),

        active:
          body.active === undefined
            ? true
            : Boolean(body.active),

        sortOrder: Number(body.sortOrder || 0),

        featuredOrder:
          body.featuredOrder !== null &&
          body.featuredOrder !== undefined
            ? Number(body.featuredOrder)
            : null
      }
    })

    /*
    ========================================
    2. ХАРАКТЕРИСТИКИ
    ========================================
    */

    const incomingSpecifications =
      body.specifications || {}

    if (
      category &&
      category.specifications.length
    ) {
      for (
        const categorySpecification
        of category.specifications
      ) {
        const specification =
          categorySpecification.specification

        const value =
          incomingSpecifications[specification.key]

        if (
          value === undefined ||
          value === null ||
          value === ''
        ) {
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
              productId: product.id,
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
              productId: product.id,
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
              productId: product.id,
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
              productId: product.id,
              specificationId: specification.id,
              optionId: option.id
            }
          })

          continue
        }
      }
    }

    /*
    ========================================
    3. ПОВЕРТАЄМО ПОВНИЙ ТОВАР
    ========================================
    */

    return tx.product.findUnique({
      where: {
        id: product.id
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