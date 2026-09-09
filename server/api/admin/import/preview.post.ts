import {
  createError,
  defineEventHandler,
  readBody
} from 'h3'

import prisma from '../../../utils/prisma'

type ImportActionChoice =
  | 'create'
  | 'update'

interface PreviewSpecificationInput {
  specificationId: number
  value: string
}

interface PreviewRowInput {
  rowNumber: number
  name: string

  brandId:
    | number
    | null

  categoryId:
    | number
    | null

  quantity:
    | number
    | null

  buyPrice:
    | number
    | null

  sellPrice:
    | number
    | null

  matchedProductId:
    | number
    | null

  requestedAction:
    | ImportActionChoice
    | null

  specifications:
    PreviewSpecificationInput[]
}

interface PreviewBody {
  rows?: PreviewRowInput[]
}

function normalizeText(
  value: unknown
) {
  return String(
    value ?? ''
  )
    .toLowerCase()
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeOptionText(
  value: unknown
) {
  return normalizeText(value)
    .replace(
      /[()[\]{}.,:;/'"\\_-]+/g,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function parseNumberValue(
  value: unknown
) {
  const normalized =
    String(
      value ?? ''
    )
      .replace(/\u00a0/g, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .match(
        /-?\d+(?:\.\d+)?/
      )?.[0]

  if (!normalized) {
    return null
  }

  const number =
    Number(normalized)

  return Number.isFinite(
    number
  )
    ? number
    : null
}

function parseBooleanValue(
  value: unknown
) {
  const normalized =
    normalizeText(value)

  if (
    [
      'так',
      'yes',
      'true',
      '1',
      '+',
      'є',
      'підтримується'
    ].includes(normalized)
  ) {
    return true
  }

  if (
    [
      'ні',
      'no',
      'false',
      '0',
      '-',
      'немає',
      'не підтримується'
    ].includes(normalized)
  ) {
    return false
  }

  return null
}

export default defineEventHandler(
  async event => {
    const body =
      await readBody<
        PreviewBody
      >(event)

    const rows =
      body?.rows

    if (
      !Array.isArray(rows) ||
      !rows.length
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Не передано товари для перевірки'
      })
    }

    if (
      rows.length > 500
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Забагато товарів в одному імпорті'
      })
    }

    const brandIds =
      [
        ...new Set(
          rows
            .map(
              row =>
                Number(
                  row.brandId
                )
            )
            .filter(
              id =>
                Number.isInteger(id) &&
                id > 0
            )
        )
      ]

    const categoryIds =
      [
        ...new Set(
          rows
            .map(
              row =>
                Number(
                  row.categoryId
                )
            )
            .filter(
              id =>
                Number.isInteger(id) &&
                id > 0
            )
        )
      ]

    const matchedProductIds =
      [
        ...new Set(
          rows
            .map(
              row =>
                Number(
                  row.matchedProductId
                )
            )
            .filter(
              id =>
                Number.isInteger(id) &&
                id > 0
            )
        )
      ]

    const [
      brands,
      categories,
      matchedProducts
    ] =
      await Promise.all([
        prisma.brand.findMany({
          where: {
            id: {
              in: brandIds
            }
          },

          select: {
            id: true,
            name: true,
            active: true
          }
        }),

        prisma.category.findMany({
          where: {
            id: {
              in: categoryIds
            }
          },

          select: {
            id: true,
            name: true,
            active: true
          }
        }),

        prisma.product.findMany({
          where: {
            id: {
              in:
                matchedProductIds
            }
          },

          select: {
            id: true,
            name: true,
            quantity: true,
            buyPrice: true,
            sellPrice: true,
            brandId: true,
            categoryId: true,
            active: true
          }
        })
      ])

    const brandMap =
      new Map(
        brands.map(
          brand => [
            brand.id,
            brand
          ]
        )
      )

    const categoryMap =
      new Map(
        categories.map(
          category => [
            category.id,
            category
          ]
        )
      )

    const productMap =
      new Map(
        matchedProducts.map(
          product => [
            product.id,
            product
          ]
        )
      )

    const resultRows = []

    for (
      const inputRow
      of rows
    ) {
      const errors:
        string[] = []

      const warnings:
        string[] = []

      const rowNumber =
        Number(
          inputRow.rowNumber
        )

      const name =
        String(
          inputRow.name ??
          ''
        ).trim()

      const brandId =
        Number(
          inputRow.brandId
        )

      const categoryId =
        Number(
          inputRow.categoryId
        )

      const quantity =
        Number(
          inputRow.quantity
        )

      const buyPrice =
        Number(
          inputRow.buyPrice
        )

      const requestedAction =
        inputRow
          .requestedAction ??
        null

      if (!name) {
        errors.push(
          'Не вказана назва товару'
        )
      }

      const brand =
        brandMap.get(
          brandId
        )

      if (!brand) {
        errors.push(
          'Бренд не знайдено у базі'
        )
      }
      else if (!brand.active) {
        errors.push(
          `Бренд "${brand.name}" вимкнений`
        )
      }

      const category =
        categoryMap.get(
          categoryId
        )

      if (!category) {
        errors.push(
          'Категорію не знайдено у базі'
        )
      }
      else if (
        !category.active
      ) {
        errors.push(
          `Категорія "${category.name}" вимкнена`
        )
      }

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity < 0
      ) {
        errors.push(
          'Кількість повинна бути цілим числом 0 або більше'
        )
      }

      if (
        !Number.isFinite(
          buyPrice
        ) ||
        buyPrice < 0
      ) {
        errors.push(
          'Некоректна закупівельна ціна'
        )
      }

      if (
        requestedAction !==
          'create' &&
        requestedAction !==
          'update'
      ) {
        errors.push(
          'Не вибрано дію: створити чи оновити'
        )
      }

      let matchedProduct =
        inputRow
          .matchedProductId
          ? productMap.get(
              Number(
                inputRow
                  .matchedProductId
              )
            ) ??
            null
          : null

      /*
        Якщо користувач вибрав UPDATE,
        існуючий товар обов'язково
        повинен бути відомий.
      */
      if (
        requestedAction ===
          'update' &&
        !matchedProduct
      ) {
        errors.push(
          'Для оновлення не знайдено існуючий товар'
        )
      }


      if (
        requestedAction ===
          'update' &&
        matchedProduct
      ) {
        if (
          matchedProduct.brandId &&
          matchedProduct.brandId !==
            brandId
        ) {
          errors.push(
            `Бренд приходу не збігається з брендом існуючого товару "${matchedProduct.name}"`
          )
        }

        if (
          matchedProduct.categoryId &&
          matchedProduct.categoryId !==
            categoryId
        ) {
          errors.push(
            `Категорія приходу не збігається з категорією існуючого товару "${matchedProduct.name}"`
          )
        }

        if (!matchedProduct.active) {
          errors.push(
            `Існуючий товар "${matchedProduct.name}" вимкнений`
          )
        }
      }

      /*
        Якщо вибрано CREATE,
        знайдений схожий товар
        не блокує створення.
      */
      if (
        requestedAction ===
          'create' &&
        matchedProduct
      ) {
        warnings.push(
          `У базі є схожий товар: "${matchedProduct.name}". Ви вибрали створення нової позиції.`
        )
      }

      const sellPriceInput =
        inputRow.sellPrice ===
          null ||
        inputRow.sellPrice ===
          undefined
          ? null
          : Number(
              inputRow.sellPrice
            )

      if (
        requestedAction ===
        'create'
      ) {
        if (
          sellPriceInput ===
            null ||
          !Number.isFinite(
            sellPriceInput
          ) ||
          sellPriceInput <= 0
        ) {
          errors.push(
            'Для нового товару потрібно вказати продажну ціну'
          )
        }
      }


      if (
        requestedAction ===
          'create' &&
        sellPriceInput !== null &&
        Number.isFinite(
          sellPriceInput
        ) &&
        Number.isFinite(
          buyPrice
        ) &&
        sellPriceInput <
          buyPrice
      ) {
        warnings.push(
          `Продажна ціна ${sellPriceInput} грн нижча за закупівельну ${buyPrice} грн`
        )
      }

      /*
        Завантажуємо характеристики,
        дозволені саме для категорії.
      */
      const categorySpecifications =
        Number.isInteger(
          categoryId
        )
          ? await prisma
              .categorySpecification
              .findMany({
                where: {
                  categoryId
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
                },

                orderBy: {
                  sortOrder:
                    'asc'
                }
              })
          : []

      const allowedMap =
        new Map(
          categorySpecifications
            .map(
              link => [
                link
                  .specificationId,
                link
              ]
            )
        )

      const normalizedSpecifications:
        Array<{
          specificationId: number
          name: string
          key: string
          value: string
          normalizedValue:
            | string
            | number
            | boolean
            | null
          optionId:
            | number
            | null
        }> = []

      const incomingSpecificationIds =
        new Set<number>()

      for (
        const inputSpecification
        of inputRow
          .specifications ??
        []
      ) {
        const specificationId =
          Number(
            inputSpecification
              .specificationId
          )

        if (
          !Number.isInteger(
            specificationId
          ) ||
          specificationId <= 0
        ) {
          errors.push(
            'Є характеристика з некоректним ID'
          )

          continue
        }

        const link =
          allowedMap.get(
            specificationId
          )

        if (!link) {
          warnings.push(
            `Характеристика #${specificationId} не належить вибраній категорії і буде пропущена`
          )

          continue
        }

        const specification =
          link.specification

        const rawValue =
          String(
            inputSpecification
              .value ??
            ''
          ).trim()

        if (!rawValue) {
          continue
        }

        incomingSpecificationIds.add(
          specificationId
        )

        let normalizedValue:
          | string
          | number
          | boolean
          | null =
            null

        let optionId:
          | number
          | null =
            null

        if (
          specification.type ===
          'NUMBER'
        ) {
          normalizedValue =
            parseNumberValue(
              rawValue
            )

          if (
            normalizedValue ===
            null
          ) {
            errors.push(
              `Не вдалося перетворити "${specification.name}" у число`
            )

            continue
          }
        }
        else if (
          specification.type ===
          'BOOLEAN'
        ) {
          normalizedValue =
            parseBooleanValue(
              rawValue
            )

          if (
            normalizedValue ===
            null
          ) {
            errors.push(
              `Не вдалося визначити Так/Ні для "${specification.name}"`
            )

            continue
          }
        }
        else if (
          specification.type ===
            'SELECT' ||
          specification.type ===
            'MULTISELECT'
        ) {
          const target =
            normalizeOptionText(
              rawValue
            )

          const option =
            specification
              .options
              .find(
                item =>
                  normalizeOptionText(
                    item.label
                  ) ===
                    target ||
                  normalizeOptionText(
                    item.value
                  ) ===
                    target
              )

          if (!option) {
            errors.push(
              `Для "${specification.name}" немає варіанта "${rawValue}"`
            )

            continue
          }

          /*
            Поточна схема ProductSpecification
            зберігає лише один optionId.
            Тому MULTISELECT поки
            фактично працює як один SELECT.
          */
          optionId =
            option.id

          normalizedValue =
            option.label

          if (
            specification.type ===
            'MULTISELECT'
          ) {
            warnings.push(
              `"${specification.name}" має тип MULTISELECT, але поточна схема зберігає лише один варіант`
            )
          }
        }
        else {
          normalizedValue =
            rawValue
        }

        normalizedSpecifications
          .push({
            specificationId,

            name:
              specification.name,

            key:
              specification.key,

            value:
              rawValue,

            normalizedValue,

            optionId
          })
      }

      /*
        Перевіряємо required
        характеристики категорії.
      */
      for (
        const link
        of categorySpecifications
      ) {
        if (
          !link.required
        ) {
          continue
        }

        if (
          !incomingSpecificationIds
            .has(
              link
                .specificationId
            )
        ) {
          errors.push(
            `Не заповнено обов'язкову характеристику "${link.specification.name}"`
          )
        }
      }

      let action:
        | 'create'
        | 'update'
        | 'blocked'

      if (errors.length) {
        action =
          'blocked'
      }
      else {
        action =
          requestedAction as
            ImportActionChoice
      }

      const quantityBefore =
        action === 'update' &&
        matchedProduct
          ? matchedProduct.quantity
          : null

      const quantityAfter =
        action === 'update' &&
        matchedProduct
          ? matchedProduct.quantity +
            quantity
          : action === 'create'
            ? quantity
            : null

      const sellPriceAfter =
        action === 'update' &&
        matchedProduct
          ? matchedProduct.sellPrice
          : action === 'create'
            ? sellPriceInput
            : null

      resultRows.push({
        rowNumber,

        name,

        action,

        requestedAction,

        ready:
          errors.length === 0,

        matchedProduct:
          matchedProduct
            ? {
                id:
                  matchedProduct.id,

                name:
                  matchedProduct.name,

                quantity:
                  matchedProduct.quantity,

                buyPrice:
                  matchedProduct.buyPrice,

                sellPrice:
                  matchedProduct.sellPrice
              }
            : null,

        quantity: {
          incoming:
            Number.isFinite(
              quantity
            )
              ? quantity
              : 0,

          before:
            quantityBefore,

          after:
            quantityAfter
        },

        buyPrice: {
          incoming:
            Number.isFinite(
              buyPrice
            )
              ? buyPrice
              : 0,

          before:
            action === 'update' &&
            matchedProduct
              ? matchedProduct.buyPrice
              : null,

          after:
            Number.isFinite(
              buyPrice
            )
              ? buyPrice
              : 0
        },

        sellPrice: {
          incoming:
            sellPriceInput,

          before:
            action === 'update' &&
            matchedProduct
              ? matchedProduct.sellPrice
              : null,

          after:
            sellPriceAfter
        },

        specifications:
          normalizedSpecifications,

        errors,
        warnings
      })
    }

    const stats = {
      total:
        resultRows.length,

      create:
        resultRows.filter(
          row =>
            row.action ===
            'create'
        ).length,

      update:
        resultRows.filter(
          row =>
            row.action ===
            'update'
        ).length,

      blocked:
        resultRows.filter(
          row =>
            row.action ===
            'blocked'
        ).length
    }

    return {
      success:
        stats.blocked === 0,

      stats,

      rows:
        resultRows
    }
  }
)
