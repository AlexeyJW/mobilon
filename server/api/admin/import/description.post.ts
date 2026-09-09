import {
  defineEventHandler,
  readBody,
  createError
} from 'h3'

import prisma from '../../../utils/prisma'

import {
  parseSupplierDescription
} from '../../../utils/import/parseSupplierDescription'

interface DescriptionRequest {
  text?: string
  productName?: string | null
  categoryId?: number | null
}

export default defineEventHandler(
  async event => {
    const body =
      await readBody<DescriptionRequest>(
        event
      )

    const text =
      String(
        body?.text ?? ''
      ).trim()

    const productName =
      String(
        body?.productName ?? ''
      ).trim()

    const categoryId =
      Number(
        body?.categoryId
      )

    if (!text) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Вставте опис товару'
      })
    }

    if (
      !Number.isInteger(
        categoryId
      ) ||
      categoryId <= 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Не визначена категорія товару'
      })
    }

    /* ==================================================
       CATEGORY + SPECIFICATIONS
    ================================================== */

    const category =
      await prisma.category.findUnique({
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

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage:
          'Категорію не знайдено'
      })
    }

    const specifications =
      category.specifications
        .filter(
          item =>
            item.specification
              .active
        )
        .map(item => ({
          id:
            item.specification.id,

          name:
            item.specification.name,

          key:
            item.specification.key,

          type:
            item.specification.type,

          unit:
            item.specification.unit,

          required:
            item.required,

          filterable:
            item.filterable,

          options:
            item.specification
              .options
              .map(option => ({
                id:
                  option.id,

                label:
                  option.label,

                value:
                  option.value
              }))
        }))

    /* ==================================================
       PARSE
    ================================================== */

    const parsed =
      parseSupplierDescription({
        text,
        productName,
        specifications
      })

    /* ==================================================
       REQUIRED SPECIFICATIONS STILL MISSING
    ================================================== */

    const parsedIds =
      new Set(
        parsed.map(
          item =>
            item.specificationId
        )
      )

    const missingSpecifications =
      specifications
        .filter(
          specification =>
            specification.required &&
            !parsedIds.has(
              specification.id
            )
        )
        .map(
          specification => ({
            id:
              specification.id,

            key:
              specification.key,

            name:
              specification.name
          })
        )

    return {
      success: true,

      productName,

      category: {
        id:
          category.id,

        name:
          category.name
      },

      specifications:
        parsed,

      parsedCount:
        parsed.length,

      missingSpecifications,

      missingSpecificationsCount:
        missingSpecifications.length
    }
  }
)