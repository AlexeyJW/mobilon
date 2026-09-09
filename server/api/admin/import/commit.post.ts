import {
  createError,
  defineEventHandler,
  readBody
} from 'h3'

import prisma from '../../../utils/prisma'

type ImportActionChoice =
  | 'create'
  | 'update'

interface ImportSpecificationInput {
  specificationId: number
  value: string
}

interface ImportRowInput {
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
    ImportSpecificationInput[]
}

interface ImportBody {
  rows?: ImportRowInput[]
}

interface PreparedSpecification {
  specificationId: number

  type:
    | 'TEXT'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'SELECT'
    | 'MULTISELECT'

  valueText: string | null
  valueNumber: number | null
  valueBoolean: boolean | null
  optionId: number | null
}

interface PreparedRow {
  rowNumber: number
  name: string
  brandId: number
  brandName: string
  categoryId: number
  categoryName: string
  quantity: number
  buyPrice: number
  sellPrice: number | null
  matchedProductId: number | null
  requestedAction: ImportActionChoice
  specifications: PreparedSpecification[]
  warnings: string[]
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

/*
  Простий slug без зовнішньої бібліотеки.
  Для моделей/брендів латиниця зберігається.
  Кирилиця транслітерується.
*/
function slugify(
  value: string
) {
  const map:
    Record<string, string> = {
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'h',
      ґ: 'g',
      д: 'd',
      е: 'e',
      є: 'ie',
      ж: 'zh',
      з: 'z',
      и: 'y',
      і: 'i',
      ї: 'i',
      й: 'i',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'kh',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'shch',
      ь: '',
      ю: 'iu',
      я: 'ia',
      ы: 'y',
      э: 'e',
      ъ: ''
    }

  const transliterated =
    value
      .toLowerCase()
      .split('')
      .map(
        char =>
          map[char] ??
          char
      )
      .join('')

  return transliterated
    .replace(/&/g, ' and ')
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    )
    .slice(
      0,
      180
    ) || 'product'
}

async function getUniqueSlug(
  tx: any,
  name: string
) {
  const base =
    slugify(name)

  let candidate =
    base

  let suffix = 2

  while (
    await tx.product.findUnique({
      where: {
        slug:
          candidate
      },

      select: {
        id: true
      }
    })
  ) {
    candidate =
      `${base}-${suffix}`

    suffix++
  }

  return candidate
}

export default defineEventHandler(
  async event => {
    const body =
      await readBody<
        ImportBody
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
          'Не передано товари для імпорту'
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
      matchedProducts,
      categorySpecificationLinks
    ] =
      await Promise.all([
        prisma.brand.findMany({
          where: {
            id: {
              in:
                brandIds
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
              in:
                categoryIds
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
            active: true,
            brandId: true,
            categoryId: true
          }
        }),

        prisma.categorySpecification
          .findMany({
            where: {
              categoryId: {
                in:
                  categoryIds
              }
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

            orderBy: [
              {
                categoryId:
                  'asc'
              },
              {
                sortOrder:
                  'asc'
              }
            ]
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

    const categorySpecificationMap =
      new Map<
        number,
        typeof categorySpecificationLinks
      >()

    for (
      const link
      of categorySpecificationLinks
    ) {
      const list =
        categorySpecificationMap
          .get(
            link.categoryId
          ) ?? []

      list.push(link)

      categorySpecificationMap
        .set(
          link.categoryId,
          list
        )
    }

    const preparedRows:
      PreparedRow[] = []

    const skippedRows:
      Array<{
        rowNumber: number
        name: string
        action: 'skipped'
        productId: null
        message: string
        warnings: string[]
      }> = []

    /*
      ВАЖЛИВО:
      commit не довіряє frontend preview.
      Уся критична перевірка виконується
      ще раз безпосередньо перед записом.
    */
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
        )
          .replace(
            /\u00a0/g,
            ' '
          )
          .replace(
            /\s+/g,
            ' '
          )
          .trim()

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

      const sellPrice =
        inputRow.sellPrice ===
          null ||
        inputRow.sellPrice ===
          undefined
          ? null
          : Number(
              inputRow.sellPrice
            )

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
      else if (!category.active) {
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

      const matchedProduct =
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
          !matchedProduct.active
        ) {
          errors.push(
            `Існуючий товар "${matchedProduct.name}" вимкнений`
          )
        }

        if (
          matchedProduct.brandId &&
          matchedProduct.brandId !==
            brandId
        ) {
          errors.push(
            `Бренд приходу не збігається з існуючим товаром "${matchedProduct.name}"`
          )
        }

        if (
          matchedProduct.categoryId &&
          matchedProduct.categoryId !==
            categoryId
        ) {
          errors.push(
            `Категорія приходу не збігається з існуючим товаром "${matchedProduct.name}"`
          )
        }
      }

      if (
        requestedAction ===
          'create'
      ) {
        if (
          sellPrice === null ||
          !Number.isFinite(
            sellPrice
          ) ||
          sellPrice <= 0
        ) {
          errors.push(
            'Для нового товару потрібно вказати продажну ціну'
          )
        }

        if (
          sellPrice !== null &&
          Number.isFinite(
            sellPrice
          ) &&
          Number.isFinite(
            buyPrice
          ) &&
          sellPrice <
            buyPrice
        ) {
          warnings.push(
            `Продажна ціна ${sellPrice} грн нижча за закупівельну ${buyPrice} грн`
          )
        }

        if (matchedProduct) {
          warnings.push(
            `У базі є схожий товар "${matchedProduct.name}", але вибрано створення нової позиції`
          )
        }
      }

      const links =
        categorySpecificationMap
          .get(
            categoryId
          ) ?? []

      const allowedMap =
        new Map(
          links.map(
            link => [
              link
                .specificationId,
              link
            ]
          )
        )

      const normalizedSpecifications:
        PreparedSpecification[] =
          []

      const validSpecificationIds =
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
            `Характеристика #${specificationId} не належить вибраній категорії і пропущена`
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

        let prepared:
          PreparedSpecification |
          null =
            null

        if (
          specification.type ===
          'NUMBER'
        ) {
          const value =
            parseNumberValue(
              rawValue
            )

          if (value === null) {
            errors.push(
              `Не вдалося перетворити "${specification.name}" у число`
            )

            continue
          }

          prepared = {
            specificationId,
            type:
              'NUMBER',
            valueText:
              null,
            valueNumber:
              value,
            valueBoolean:
              null,
            optionId:
              null
          }
        }
        else if (
          specification.type ===
          'BOOLEAN'
        ) {
          const value =
            parseBooleanValue(
              rawValue
            )

          if (value === null) {
            errors.push(
              `Не вдалося визначити Так/Ні для "${specification.name}"`
            )

            continue
          }

          prepared = {
            specificationId,
            type:
              'BOOLEAN',
            valueText:
              null,
            valueNumber:
              null,
            valueBoolean:
              value,
            optionId:
              null
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

          prepared = {
            specificationId,
            type:
              specification.type,
            valueText:
              null,
            valueNumber:
              null,
            valueBoolean:
              null,
            optionId:
              option.id
          }

          if (
            specification.type ===
            'MULTISELECT'
          ) {
            warnings.push(
              `"${specification.name}" має MULTISELECT, але поточна схема зберігає лише один варіант`
            )
          }
        }
        else {
          prepared = {
            specificationId,
            type:
              'TEXT',
            valueText:
              rawValue,
            valueNumber:
              null,
            valueBoolean:
              null,
            optionId:
              null
          }
        }

        normalizedSpecifications
          .push(
            prepared
          )

        validSpecificationIds
          .add(
            specificationId
          )
      }

      for (
        const link
        of links
      ) {
        if (!link.required) {
          continue
        }

        if (
          !validSpecificationIds
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

      if (
        errors.length ||
        !brand ||
        !category ||
        (
          requestedAction !==
            'create' &&
          requestedAction !==
            'update'
        )
      ) {
        skippedRows.push({
          rowNumber:
            Number.isFinite(
              rowNumber
            )
              ? rowNumber
              : 0,

          name:
            name ||
            `Рядок ${rowNumber}`,

          action:
            'skipped',

          productId:
            null,

          message:
            errors.join('; ') ||
            'Позиція не пройшла перевірку',

          warnings
        })

        continue
      }

      preparedRows.push({
        rowNumber,
        name,
        brandId,
        brandName:
          brand.name,
        categoryId,
        categoryName:
          category.name,
        quantity,
        buyPrice,
        sellPrice,
        matchedProductId:
          matchedProduct?.id ??
          null,
        requestedAction,
        specifications:
          normalizedSpecifications,
        warnings
      })
    }

    if (!preparedRows.length) {
      return {
        success:
          false,

        stats: {
          total:
            rows.length,
          created:
            0,
          updated:
            0,
          skipped:
            skippedRows.length
        },

        rows:
          skippedRows
      }
    }

    /*
      Усі ГОТОВІ позиції записуються
      однією транзакцією.

      Якщо під час запису готових
      позицій виникне DB-помилка,
      вони всі відкотяться.
      Заблоковані рядки взагалі
      не потрапляють у транзакцію.
    */
    const importedRows =
      await prisma.$transaction(
        async tx => {
          const output:
            Array<{
              rowNumber: number
              name: string
              action:
                | 'created'
                | 'updated'
              productId: number
              message: string
              warnings: string[]
            }> = []

          for (
            const row
            of preparedRows
          ) {
            if (
              row.requestedAction ===
              'create'
            ) {
              const slug =
                await getUniqueSlug(
                  tx,
                  row.name
                )

              const product =
                await tx.product.create({
                  data: {
                    name:
                      row.name,

                    brand:
                      row.brandName,

                    brandId:
                      row.brandId,

                    category:
                      row.categoryName,

                    categoryId:
                      row.categoryId,

                    slug,

                    buyPrice:
                      row.buyPrice,

                    sellPrice:
                      row.sellPrice as number,

                    quantity:
                      row.quantity,

                    active:
                      true
                  },

                  select: {
                    id: true,
                    name: true
                  }
                })

              for (
                const specification
                of row.specifications
              ) {
                await tx
                  .productSpecification
                  .create({
                    data: {
                      productId:
                        product.id,

                      specificationId:
                        specification
                          .specificationId,

                      valueText:
                        specification
                          .valueText,

                      valueNumber:
                        specification
                          .valueNumber,

                      valueBoolean:
                        specification
                          .valueBoolean,

                      optionId:
                        specification
                          .optionId
                    }
                  })
              }

              output.push({
                rowNumber:
                  row.rowNumber,

                name:
                  product.name,

                action:
                  'created',

                productId:
                  product.id,

                message:
                  'Новий товар створено',

                warnings:
                  row.warnings
              })

              continue
            }

            const productId =
              row.matchedProductId as
                number

            const updated =
              await tx.product.update({
                where: {
                  id:
                    productId
                },

                data: {
                  quantity: {
                    increment:
                      row.quantity
                  },

                  /*
                    Остання закупівельна
                    ціна приходу стає
                    поточною buyPrice.
                  */
                  buyPrice:
                    row.buyPrice
                },

                select: {
                  id: true,
                  name: true
                }
              })

            /*
              Оновлюємо лише ті
              характеристики, які
              прийшли у фінальній картці.

              Інші характеристики
              існуючого товару не видаляємо.
            */
            for (
              const specification
              of row.specifications
            ) {
              await tx
                .productSpecification
                .upsert({
                  where: {
                    productId_specificationId: {
                      productId:
                        updated.id,

                      specificationId:
                        specification
                          .specificationId
                    }
                  },

                  create: {
                    productId:
                      updated.id,

                    specificationId:
                      specification
                        .specificationId,

                    valueText:
                      specification
                        .valueText,

                    valueNumber:
                      specification
                        .valueNumber,

                    valueBoolean:
                      specification
                        .valueBoolean,

                    optionId:
                      specification
                        .optionId
                  },

                  update: {
                    valueText:
                      specification
                        .valueText,

                    valueNumber:
                      specification
                        .valueNumber,

                    valueBoolean:
                      specification
                        .valueBoolean,

                    optionId:
                      specification
                        .optionId
                  }
                })
            }

            output.push({
              rowNumber:
                row.rowNumber,

              name:
                updated.name,

              action:
                'updated',

              productId:
                updated.id,

              message:
                `Залишок збільшено на ${row.quantity}, закупівельну ціну оновлено`,

              warnings:
                row.warnings
            })
          }

          return output
        }
      )

    const created =
      importedRows.filter(
        row =>
          row.action ===
          'created'
      ).length

    const updated =
      importedRows.filter(
        row =>
          row.action ===
          'updated'
      ).length

    return {
      success:
        true,

      stats: {
        total:
          rows.length,

        created,

        updated,

        skipped:
          skippedRows.length
      },

      rows: [
        ...importedRows,
        ...skippedRows
      ].sort(
        (
          a,
          b
        ) =>
          a.rowNumber -
          b.rowNumber
      )
    }
  }
)
