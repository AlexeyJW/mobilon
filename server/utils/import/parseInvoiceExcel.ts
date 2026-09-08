import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

type ExcelCell =
  | string
  | number
  | boolean
  | null

interface DetectedColumns {
  name: number | null
  category: number | null
  quantity: number | null
  price: number | null
  sku: number | null
  supplierCode: number | null
  barcode: number | null
}

const aliases = {
  name: [
    'товар',
    'назва',
    'назва товару',
    'найменування',
    'найменування товару',
    'наименование',
    'наименование товара',
    'номенклатура',
    'марка',
    'product',
    'product name',
    'name'
  ],

  category: [
    'категорія',
    'категория',
    'category'
  ],

  quantity: [
    'кількість',
    'к-сть',
    'ксть',
    'количество',
    'кол-во',
    'кол во',
    'qty',
    'quantity'
  ],

  price: [
    'ціна',
    'цена',
    'закупівельна ціна',
    'ціна закупки',
    'закупочная цена',
    'цена закупки',
    'price',
    'purchase price'
  ],

  sku: [
    'артикул',
    'sku',
    'vendor code'
  ],

  supplierCode: [
    'код',
    'код товару',
    'код товара',
    'product code'
  ],

  barcode: [
    'штрихкод',
    'штрих-код',
    'штрих код',
    'barcode',
    'ean',
    'ean13'
  ]
} satisfies Record<
  keyof DetectedColumns,
  string[]
>

/* ==================================================
   NORMALIZE
================================================== */

function normalizeText(
  value: unknown
) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\u00a0/g, ' ')
    .replace(/[._:/\\()[\]-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  const cleaned =
    String(value)
      .replace(/\u00a0/g, '')
      .replace(/\s/g, '')
      .replace(
        /[₴грнuahUAH]/g,
        ''
      )
      .replace(',', '.')
      .replace(
        /[^\d.-]/g,
        ''
      )

  if (!cleaned) {
    return null
  }

  const number =
    Number(cleaned)

  return Number.isFinite(number)
    ? number
    : null
}

/* ==================================================
   HEADER MATCHING
================================================== */

function matchHeader(
  value: unknown,
  list: string[]
) {
  const normalized =
    normalizeText(value)

  if (!normalized) {
    return false
  }

  return list.some(alias => {
    const normalizedAlias =
      normalizeText(alias)

    return (
      normalized ===
        normalizedAlias ||
      normalized.includes(
        normalizedAlias
      )
    )
  })
}

function detectColumns(
  headers: ExcelCell[]
): DetectedColumns {
  const result:
    DetectedColumns = {
      name: null,
      category: null,
      quantity: null,
      price: null,
      sku: null,
      supplierCode: null,
      barcode: null
    }

  headers.forEach(
    (header, index) => {
      for (
        const key of
        Object.keys(
          aliases
        ) as Array<
          keyof DetectedColumns
        >
      ) {
        if (
          result[key] === null &&
          matchHeader(
            header,
            aliases[key]
          )
        ) {
          result[key] = index
        }
      }
    }
  )

  return result
}

function scoreHeaderRow(
  row: ExcelCell[]
) {
  const detected =
    detectColumns(row)

  let score = 0

  for (
    const value of
    Object.values(detected)
  ) {
    if (value !== null) {
      score++
    }
  }

  /*
    Назва товару для нас
    найважливіша.
  */
  if (
    detected.name !== null
  ) {
    score += 3
  }

  /*
    Кількість і ціна теж дуже
    важливі для накладної.
  */
  if (
    detected.quantity !== null
  ) {
    score++
  }

  if (
    detected.price !== null
  ) {
    score++
  }

  return {
    score,
    detected
  }
}

function findHeaderRow(
  rows: ExcelCell[][]
) {
  let bestIndex = -1
  let bestScore = -1

  let bestColumns:
    DetectedColumns | null =
      null

  /*
    Заголовки накладної можуть
    бути не в першому рядку.
  */
  const limit =
    Math.min(
      rows.length,
      30
    )

  for (
    let index = 0;
    index < limit;
    index++
  ) {
    const row =
      rows[index]

    if (!row?.length) {
      continue
    }

    const {
      score,
      detected
    } =
      scoreHeaderRow(row)

    if (
      score > bestScore
    ) {
      bestIndex = index
      bestScore = score
      bestColumns =
        detected
    }
  }

  if (
    bestIndex === -1 ||
    !bestColumns ||
    bestColumns.name === null
  ) {
    return null
  }

  return {
    index: bestIndex,
    columns:
      bestColumns,
    score:
      bestScore
  }
}

/* ==================================================
   HELPERS
================================================== */

function cell(
  row: ExcelCell[],
  index: number | null
) {
  if (index === null) {
    return null
  }

  return (
    row[index] ?? null
  )
}

function stringCell(
  row: ExcelCell[],
  index: number | null
) {
  const value =
    cell(row, index)

  if (
    value === null ||
    value === undefined
  ) {
    return null
  }

  const result =
    String(value).trim()

  return result || null
}

function createRawObject(
  headers: ExcelCell[],
  row: ExcelCell[]
) {
  const result:
    Record<
      string,
      ExcelCell
    > = {}

  headers.forEach(
    (header, index) => {
      const key =
        String(
          header ?? ''
        ).trim() ||
        `Колонка ${index + 1}`

      result[key] =
        row[index] ?? null
    }
  )

  return result
}

/* ==================================================
   PARSER
================================================== */

export function parseInvoiceExcel(
  buffer: Buffer
) {
  const workbook =
    XLSX.read(
      buffer,
      {
        type: 'buffer',
        cellDates: true
      }
    )

  if (
    !workbook
      .SheetNames
      .length
  ) {
    throw new Error(
      'Excel файл не містить листів'
    )
  }

  /*
    Шукаємо перший
    непорожній лист.
  */

  let selectedSheetName:
    string | null = null

  let rows:
    ExcelCell[][] = []

  for (
    const sheetName
    of workbook.SheetNames
  ) {
    const worksheet =
      workbook.Sheets[
        sheetName
      ]

    if (!worksheet) {
      continue
    }

    const sheetRows =
      XLSX.utils
        .sheet_to_json<
          ExcelCell[]
        >(
          worksheet,
          {
            header: 1,
            defval: null,
            raw: true,
            blankrows: false
          }
        )

    if (
      sheetRows.length
    ) {
      selectedSheetName =
        sheetName

      rows =
        sheetRows

      break
    }
  }

  if (
    !selectedSheetName ||
    !rows.length
  ) {
    throw new Error(
      'У файлі не знайдено даних'
    )
  }

  /* ==================================================
     FIND HEADER
  ================================================== */

  const header =
    findHeaderRow(rows)

  if (!header) {
    throw new Error(
      'Не вдалося знайти колонку з назвою товару'
    )
  }

  const headers =
    rows[header.index]

  if (!headers) {
    throw new Error(
      'Не вдалося прочитати рядок заголовків'
    )
  }

  const dataRows =
    rows.slice(
      header.index + 1
    )

  /* ==================================================
     PARSE ROWS
  ================================================== */

  const parsedRows =
    dataRows
      .map(
        (
          row,
          index
        ) => {
          /*
            NAME
          */

          const name =
            stringCell(
              row,
              header
                .columns
                .name
            ) ?? ''

          /*
            CATEGORY FROM SUPPLIER
          */

          const supplierCategory =
            stringCell(
              row,
              header
                .columns
                .category
            )

          /*
            QUANTITY
          */

          const quantity =
            normalizeNumber(
              cell(
                row,
                header
                  .columns
                  .quantity
              )
            )

          /*
            BUY PRICE
          */

          const buyPrice =
            normalizeNumber(
              cell(
                row,
                header
                  .columns
                  .price
              )
            )

          /*
            SKU
          */

          const sku =
            stringCell(
              row,
              header
                .columns
                .sku
            )

          /*
            SUPPLIER CODE
          */

          const supplierCode =
            stringCell(
              row,
              header
                .columns
                .supplierCode
            )

          /*
            BARCODE
          */

          const barcode =
            stringCell(
              row,
              header
                .columns
                .barcode
            )

          /* ==================================================
             WARNINGS
          ================================================== */

          const warnings:
            string[] = []

          if (!name) {
            warnings.push(
              'Не знайдено назву товару'
            )
          }

          if (
            quantity === null
          ) {
            warnings.push(
              'Не визначено кількість'
            )
          }

          if (
            buyPrice === null
          ) {
            warnings.push(
              'Не визначено закупівельну ціну'
            )
          }

          /*
            Реальний номер рядка
            у файлі Excel.

            index + 1:
            тому що dataRows
            починається після header.

            + header.index
            + ще 1 через індексацію
            з нуля.
          */

          const rowNumber =
            header.index +
            index +
            2

          return {
            rowNumber,

            raw:
              createRawObject(
                headers,
                row
              ),

            parsed: {
              name,

              supplierCategory,

              quantity,

              buyPrice,

              sku,

              supplierCode,

              barcode
            },

            warnings,

            status:
              warnings.length
                ? 'warning'
                : 'ready'
          }
        }
      )

      /* ==================================================
         REMOVE EMPTY / TOTAL ROWS
      ================================================== */

      .filter(row => {
        /*
          Без назви товару рядок
          нам поки не потрібен.

          Це також відсікає більшість
          підсумків і службових рядків.
        */

        if (
          !row.parsed.name
        ) {
          return false
        }

        /*
          Відсікаємо типові
          підсумкові рядки.
        */

        const normalizedName =
          normalizeText(
            row.parsed.name
          )

        const totalWords = [
          'всього',
          'итого',
          'разом',
          'total'
        ]

        if (
          totalWords.some(
            word =>
              normalizedName ===
                word ||
              normalizedName
                .startsWith(
                  `${word} `
                )
          )
        ) {
          return false
        }

        return true
      })

  /* ==================================================
     RESULT
  ================================================== */

  return {
    sheetName:
      selectedSheetName,

    headerRow:
      header.index + 1,

    headers:
      headers.map(
        value =>
          String(
            value ?? ''
          ).trim()
      ),

    detectedColumns: {
      name:
        header
          .columns
          .name !== null
          ? headers[
              header
                .columns
                .name
            ] ?? null
          : null,

      category:
        header
          .columns
          .category !== null
          ? headers[
              header
                .columns
                .category
            ] ?? null
          : null,

      quantity:
        header
          .columns
          .quantity !== null
          ? headers[
              header
                .columns
                .quantity
            ] ?? null
          : null,

      price:
        header
          .columns
          .price !== null
          ? headers[
              header
                .columns
                .price
            ] ?? null
          : null,

      sku:
        header
          .columns
          .sku !== null
          ? headers[
              header
                .columns
                .sku
            ] ?? null
          : null,

      supplierCode:
        header
          .columns
          .supplierCode !== null
          ? headers[
              header
                .columns
                .supplierCode
            ] ?? null
          : null,

      barcode:
        header
          .columns
          .barcode !== null
          ? headers[
              header
                .columns
                .barcode
            ] ?? null
          : null
    },

    rows:
      parsedRows,

    stats: {
      total:
        parsedRows.length,

      ready:
        parsedRows.filter(
          row =>
            row.status ===
            'ready'
        ).length,

      warning:
        parsedRows.filter(
          row =>
            row.status ===
            'warning'
        ).length
    }
  }
}