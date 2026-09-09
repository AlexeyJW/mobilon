import {
  createError,
  defineEventHandler,
  readBody
} from 'h3'

interface TextImportBody {
  text?: string
}

type CellValue =
  | string
  | number
  | boolean
  | null

interface ParsedTextRow {
  name: string
  quantity: number | null
  buyPrice: number | null
  sku: string | null
  supplierCode: string | null
  barcode: string | null
}

function normalizeNumber(
  value: unknown
): number | null {
  const source =
    String(value ?? '')
      .replace(/\u00a0/g, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .replace(
        /[^\d.-]/g,
        ''
      )

  if (!source) {
    return null
  }

  const number =
    Number(source)

  return Number.isFinite(
    number
  )
    ? number
    : null
}

function cleanName(
  value: unknown
) {
  return String(
    value ?? ''
  )
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(
      /^[•·▪◦\-–—]+\s*/,
      ''
    )
    .trim()
}

function isServiceLine(
  value: string
) {
  const normalized =
    value
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()

  if (!normalized) {
    return true
  }

  return [
    /^чек\b/,
    /^накладна\b/,
    /^накладная\b/,
    /^рахунок\b/,
    /^счет\b/,
    /^дата\b/,
    /^час\b/,
    /^итого\b/,
    /^разом\b/,
    /^всього\b/,
    /^сума\b/,
    /^сумма\b/,
    /^до сплати\b/,
    /^к оплате\b/,
    /^пдв\b/,
    /^ндс\b/,
    /^продавець\b/,
    /^продавец\b/,
    /^покупець\b/,
    /^покупатель\b/
  ].some(
    pattern =>
      pattern.test(
        normalized
      )
  )
}

function parseDelimitedLine(
  line: string
): ParsedTextRow | null {
  const delimiter =
    line.includes('|')
      ? '|'
      : line.includes('\t')
        ? '\t'
        : line.includes(';')
          ? ';'
          : null

  if (!delimiter) {
    return null
  }

  const parts =
    line
      .split(delimiter)
      .map(
        part =>
          part.trim()
      )
      .filter(Boolean)

  if (!parts.length) {
    return null
  }

  /*
    Підтримуємо основний формат:
    Назва | кількість | ціна

    Якщо частин більше — все до
    останніх двох полів вважаємо назвою.
  */
  if (parts.length >= 3) {
    const quantity =
      normalizeNumber(
        parts[
          parts.length - 2
        ]
      )

    const buyPrice =
      normalizeNumber(
        parts[
          parts.length - 1
        ]
      )

    const name =
      cleanName(
        parts
          .slice(
            0,
            parts.length - 2
          )
          .join(' ')
      )

    if (name) {
      return {
        name,
        quantity,
        buyPrice,
        sku: null,
        supplierCode: null,
        barcode: null
      }
    }
  }

  return null
}

function parseNaturalLine(
  line: string
): ParsedTextRow {
  let working =
    cleanName(line)

  let quantity:
    number | null = null

  let buyPrice:
    number | null = null

  /*
    Кількість:
    2 шт
    2шт.
    x2
    ×2
  */
  const quantityMatch =
    working.match(
      /(?:^|\s)(?:x|×)?\s*(\d{1,4})\s*(?:шт\.?|pcs?|од\.?|одиниц[іяи]?)\b/i
    )

  if (quantityMatch?.[1]) {
    quantity =
      Number(
        quantityMatch[1]
      )

    working =
      working.replace(
        quantityMatch[0],
        ' '
      )
  }

  /*
    Ціна:
    3890 грн
    3890.50 UAH
    ₴3890
  */
  const priceMatches =
    [
      ...working.matchAll(
        /(?:₴\s*)?(\d[\d\s]*[.,]?\d*)\s*(?:грн\.?|uah|₴)\b/gi
      )
    ]

  if (priceMatches.length) {
    const last =
      priceMatches[
        priceMatches.length - 1
      ]

    buyPrice =
      normalizeNumber(
        last?.[1]
      )

    if (last?.[0]) {
      working =
        working.replace(
          last[0],
          ' '
        )
    }
  }

  /*
    Якщо ціна без "грн", пробуємо
    останнє число лише тоді, коли
    кількість вже була явно вказана.
  */
  if (
    buyPrice === null &&
    quantity !== null
  ) {
    const trailingPrice =
      working.match(
        /\s(\d{2,7}(?:[.,]\d{1,2})?)\s*$/
      )

    if (trailingPrice?.[1]) {
      buyPrice =
        normalizeNumber(
          trailingPrice[1]
        )

      working =
        working.slice(
          0,
          trailingPrice.index
        )
    }
  }

  const name =
    cleanName(working)

  return {
    name,
    quantity,
    buyPrice,
    sku: null,
    supplierCode: null,
    barcode: null
  }
}

function parseLine(
  line: string
) {
  return (
    parseDelimitedLine(
      line
    ) ??
    parseNaturalLine(
      line
    )
  )
}

export default defineEventHandler(
  async event => {
    const body =
      await readBody<
        TextImportBody
      >(event)

    const source =
      String(
        body?.text ??
        ''
      )
        .replace(
          /\r\n?/g,
          '\n'
        )
        .trim()

    if (!source) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Текст порожній'
      })
    }

    if (
      source.length >
      100_000
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Текст занадто великий'
      })
    }

    const lines =
      source
        .split('\n')
        .map(
          line =>
            line.trim()
        )
        .filter(Boolean)
        .filter(
          line =>
            !isServiceLine(
              line
            )
        )

    const rows =
      lines
        .map(
          (
            line,
            index
          ) => {
            const parsed =
              parseLine(line)

            const warnings:
              string[] = []

            if (!parsed.name) {
              warnings.push(
                'Не знайдено назву товару'
              )
            }

            if (
              parsed.quantity ===
              null
            ) {
              warnings.push(
                'Не визначено кількість'
              )
            }

            if (
              parsed.buyPrice ===
              null
            ) {
              warnings.push(
                'Не визначено закупівельну ціну'
              )
            }

            const rowNumber =
              index + 1

            const raw:
              Record<
                string,
                CellValue
              > = {
                Текст:
                  line
              }

            return {
              rowNumber,

              raw,

              parsed: {
                name:
                  parsed.name,

                supplierCategory:
                  null,

                quantity:
                  parsed.quantity,

                buyPrice:
                  parsed.buyPrice,

                sku:
                  parsed.sku,

                supplierCode:
                  parsed.supplierCode,

                barcode:
                  parsed.barcode
              },

              warnings,

              status:
                warnings.length
                  ? 'warning'
                  : 'ready'
            }
          }
        )
        .filter(
          row =>
            Boolean(
              row.parsed.name
            )
        )

    if (!rows.length) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Не вдалося знайти товари у тексті'
      })
    }

    const ready =
      rows.filter(
        row =>
          row.status ===
          'ready'
      ).length

    const warning =
      rows.length -
      ready

    return {
      fileName:
        'Ручне введення',

      sheetName:
        'Текст',

      headerRow:
        0,

      headers: [
        'Текст'
      ],

      detectedColumns: {
        name:
          'Рядок товару',

        category:
          null,

        quantity:
          'Автоматично',

        price:
          'Автоматично',

        sku:
          null,

        supplierCode:
          null,

        barcode:
          null
      },

      rows,

      stats: {
        total:
          rows.length,

        ready,

        warning
      }
    }
  }
)
