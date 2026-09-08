import {
  createError,
  defineEventHandler,
  readBody
} from 'h3'

import prisma from '../../../utils/prisma'

import {
  matchBrand
} from '../../../utils/import/matchBrand'

import {
  matchCategory
} from '../../../utils/import/matchCategory'

import {
  parseSpecifications
} from '../../../utils/import/parseSpecifications'

interface InputRow {
  rowNumber: number
  name: string
  supplierCategory?: string | null
  quantity: number | null
  buyPrice: number | null
  sku?: string | null
  supplierCode?: string | null
  barcode?: string | null
}

function calculateConfidence(
  options: {
    brandConfidence: number
    hasBrand: boolean
    categoryConfidence: number
    hasCategory: boolean
    specificationConfidence: number | null
    quantityValid: boolean
    priceValid: boolean
  }
) {
  let score = 0

  if (options.hasBrand) {
    score +=
      0.2 *
      options.brandConfidence
  }

  if (options.hasCategory) {
    score +=
      0.4 *
      options.categoryConfidence
  }

  if (
    options.specificationConfidence !==
    null
  ) {
    score +=
      0.25 *
      options.specificationConfidence
  }

  if (options.quantityValid) {
    score += 0.075
  }

  if (options.priceValid) {
    score += 0.075
  }

  if (!options.hasCategory) {
    score =
      Math.min(
        score,
        0.49
      )
  }

  if (!options.hasBrand) {
    score =
      Math.min(
        score,
        0.79
      )
  }

  return Math.max(
    0,
    Math.min(
      1,
      score
    )
  )
}

export default defineEventHandler(
  async event => {
    const body =
      await readBody<{
        rows?: InputRow[]
      }>(event)

    if (
      !body.rows ||
      !Array.isArray(
        body.rows
      )
    ) {
      throw createError({
        statusCode: 400,
        message:
          'Не отримано товари для аналізу'
      })
    }

    if (
      body.rows.length >
      1000
    ) {
      throw createError({
        statusCode: 400,
        message:
          'Забагато товарів. Максимум 1000 позицій за один імпорт'
      })
    }

    const [
      brands,
      categories,
      existingProducts
    ] =
      await Promise.all([
        prisma.brand.findMany({
          where: {
            active: true
          },

          select: {
            id: true,
            name: true,
            slug: true
          }
        }),

        prisma.category.findMany({
          where: {
            active: true
          },

          select: {
            id: true,
            name: true,
            slug: true,

            specifications: {
              orderBy: {
                sortOrder: 'asc'
              },

              include: {
                specification: {
                  include: {
                    options: {
                      orderBy: {
                        sortOrder:
                          'asc'
                      }
                    }
                  }
                }
              }
            }
          }
        }),

        prisma.product.findMany({
          where: {
            active: true
          },

          select: {
            id: true,
            name: true,
            brandId: true,
            categoryId: true,

            categoryRef: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        })
      ])

    const analyzedRows =
      body.rows.map(row => {
        const warnings:
          string[] = []

        const brandMatch =
          matchBrand(
            row.name,
            brands
          )

        const categoryMatch =
          matchCategory({
            productName:
              row.name,

            supplierCategory:
              row.supplierCategory ??
              null,

            brandId:
              brandMatch.brand
                ?.id ??
              null,

            categories,

            existingProducts
          })

        const fullCategory =
          categoryMatch.category
            ? categories.find(
                category =>
                  category.id ===
                  categoryMatch
                    .category
                    ?.id
              )
            : null

        const specifications =
          fullCategory
            ? parseSpecifications(
                row.name,
                fullCategory
                  .specifications
              )
            : []

        const missingSpecifications =
          fullCategory
            ? fullCategory
                .specifications
                .filter(
                  relation =>
                    relation.required
                )
                .filter(
                  relation =>
                    !specifications.some(
                      parsed =>
                        parsed
                          .specificationId ===
                        relation
                          .specification
                          .id
                    )
                )
                .map(
                  relation => ({
                    id:
                      relation
                        .specification
                        .id,

                    key:
                      relation
                        .specification
                        .key,

                    name:
                      relation
                        .specification
                        .name
                  })
                )
            : []

        if (
          !brandMatch.brand
        ) {
          warnings.push(
            'Не визначено бренд'
          )
        }

        if (
          !categoryMatch
            .category
        ) {
          warnings.push(
            'Не визначено категорію'
          )
        }

        if (
          row.quantity ===
          null
        ) {
          warnings.push(
            'Не визначено кількість'
          )
        }

        if (
          row.buyPrice ===
          null
        ) {
          warnings.push(
            'Не визначено закупівельну ціну'
          )
        }

        const specificationConfidence =
          specifications.length
            ? specifications.reduce(
                (
                  total,
                  specification
                ) =>
                  total +
                  specification
                    .confidence,
                0
              ) /
              specifications.length
            : null

        const confidence =
          calculateConfidence({
            hasBrand:
              Boolean(
                brandMatch.brand
              ),

            brandConfidence:
              brandMatch
                .confidence,

            hasCategory:
              Boolean(
                categoryMatch
                  .category
              ),

            categoryConfidence:
              categoryMatch
                .confidence,

            specificationConfidence,

            quantityValid:
              row.quantity !==
              null,

            priceValid:
              row.buyPrice !==
              null
          })

        const confidencePercent =
          Math.round(
            confidence * 100
          )

        let status:
          | 'ready'
          | 'review'
          | 'warning'

        if (
          !categoryMatch
            .category ||
          row.quantity ===
            null ||
          row.buyPrice ===
            null
        ) {
          status = 'warning'
        }
        else if (
          warnings.length ||
          confidence < 0.8
        ) {
          status = 'review'
        }
        else {
          status = 'ready'
        }

        return {
          rowNumber:
            row.rowNumber,

          source: {
            name:
              row.name,

            supplierCategory:
              row.supplierCategory ??
              null,

            quantity:
              row.quantity,

            buyPrice:
              row.buyPrice,

            sku:
              row.sku ??
              null,

            supplierCode:
              row.supplierCode ??
              null,

            barcode:
              row.barcode ??
              null
          },

          brand:
            brandMatch.brand
              ? {
                  id:
                    brandMatch
                      .brand.id,

                  name:
                    brandMatch
                      .brand.name,

                  confidence:
                    brandMatch
                      .confidence
                }
              : null,

          category:
            categoryMatch
              .category
              ? {
                  id:
                    categoryMatch
                      .category.id,

                  name:
                    categoryMatch
                      .category.name,

                  confidence:
                    categoryMatch
                      .confidence,

                  source:
                    categoryMatch
                      .source
                }
              : null,

          matchedProduct:
            categoryMatch
              .matchedProduct ??
            null,

          specifications,

          missingSpecifications,

          missingSpecificationsCount:
            missingSpecifications
              .length,

          confidence:
            Number(
              confidence.toFixed(
                3
              )
            ),

          confidencePercent,

          warnings,

          status
        }
      })

    return {
      rows:
        analyzedRows,

      stats: {
        total:
          analyzedRows.length,

        ready:
          analyzedRows.filter(
            row =>
              row.status ===
              'ready'
          ).length,

        review:
          analyzedRows.filter(
            row =>
              row.status ===
              'review'
          ).length,

        warning:
          analyzedRows.filter(
            row =>
              row.status ===
              'warning'
          ).length
      }
    }
  }
)