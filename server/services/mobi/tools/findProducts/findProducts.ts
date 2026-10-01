import prisma from '../../../../utils/prisma'
import type { FindProductsInput } from './schema'
import { normalizeQuery } from './normalizeQuery'

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[\/\\,+_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// --------------------------------------------------
// Пам'ять ROM
// --------------------------------------------------

function extractStorage(query: string): number | null {
  const normalized = normalizeText(query)

  // 256GB / 256 GB / 256 ГБ
  const gbMatch = normalized.match(
    /\b(32|64|128|256|512|1024)\s*(?:gb|гб)\b/
  )

  if (gbMatch) {
    return Number(gbMatch[1])
  }

  // 8/256 або 8 256
  const pairMatch = normalized.match(
    /\b(?:4|6|8|12|16)\s+(32|64|128|256|512|1024)\b/
  )

  if (pairMatch) {
    return Number(pairMatch[1])
  }

  // Просто 256
  const storageMatch = normalized.match(
    /\b(32|64|128|256|512|1024)\b/
  )

  if (storageMatch) {
    return Number(storageMatch[1])
  }

  return null
}

// --------------------------------------------------
// RAM
// --------------------------------------------------

function extractRam(query: string): number | null {
  const normalized = normalizeText(query)

  // 8GB / 8 GB / 8 ГБ
  const gbMatch = normalized.match(
    /\b(2|3|4|6|8|12|16)\s*(?:gb|гб)\b/
  )

  if (gbMatch) {
    return Number(gbMatch[1])
  }

  // 8/256
  const pairMatch = normalized.match(
    /\b(2|3|4|6|8|12|16)\s+(32|64|128|256|512|1024)\b/
  )

  if (pairMatch) {
    return Number(pairMatch[1])
  }

  return null
}

// --------------------------------------------------
// Модель
// --------------------------------------------------

function extractModel(tokens: string[]) {
  return (
    tokens.find(token =>
      /^[a-z]+\d+[a-z]*$/i.test(token)
    ) ?? null
  )
}

// --------------------------------------------------
// Бренд
// --------------------------------------------------

function extractBrand(tokens: string[]) {
  const brands = [
    'samsung',
    'xiaomi',
    'apple',
    'motorola',
    'huawei',
    'honor',
    'oppo',
    'realme',
    'tecno',
    'infinix',
    'nokia',
    'oneplus',
    'zte'
  ]

  return (
    tokens.find(token =>
      brands.includes(token.toLowerCase())
    ) ?? null
  )
}

// --------------------------------------------------
// Лінійка товару
// --------------------------------------------------

function extractProductLine(tokens: string[]) {
  const lines = [
    'redmi',
    'poco',
    'galaxy',
    'iphone'
  ]

  return (
    tokens.find(token =>
      lines.includes(token.toLowerCase())
    ) ?? null
  )
}

// --------------------------------------------------
// Категорія
// --------------------------------------------------

function extractCategory(query: string) {
  const normalized = normalizeText(query)

  const categories = [
    'смартфони',
    'навушники',
    'зарядні пристрої',
    'кабелі',
    'повербанк',
    'чохол',
    'захисне скло'
  ]

  return (
    categories.find(category =>
      normalized.includes(category)
    ) ?? null
  )
}

// --------------------------------------------------
// Головний пошук
// --------------------------------------------------

export async function findProducts(input: FindProductsInput) {


  // --------------------------------------------------
  // Нормалізація запиту
  // --------------------------------------------------

  const query = normalizeQuery(input.query)

  

  const normalizedQuery = normalizeText(query)



  const tokens = normalizedQuery
    .split(/\s+/)
    .filter(Boolean)

  

  // --------------------------------------------------
  // Розбір запиту
  // --------------------------------------------------

  const brand = extractBrand(tokens)
  const productLine = extractProductLine(tokens)
  const category = extractCategory(normalizedQuery)

  const model = extractModel(tokens)
  const storage = extractStorage(normalizedQuery)
  const ram = extractRam(normalizedQuery)



  // --------------------------------------------------
  // Службові слова
  // --------------------------------------------------

  const serviceWords = new Set([
    'до',
    'від',
    'грн',
    'гривень',
    'гривні',
    'гривня',
    'покажи',
    'показати',
    'знайди',
    'знайти',
    'потрібен',
    'потрібна',
    'потрібно',
    'хочу',
    'мені',
    'будь',
    'ласка'
  ])

  // Слова категорій не повинні шукатися в назві товару
  const categoryWords = new Set([
    'смартфони',
    'навушники',
    'зарядні',
    'пристрої',
    'кабелі',
    'повербанк',
    'чохол',
    'захисне',
    'скло'
  ])

  // --------------------------------------------------
  // Токени, за якими реально шукаємо name
  // --------------------------------------------------

  const searchTokens = tokens.filter(token => {
    const value = token.toLowerCase()

    if (serviceWords.has(value)) {
      return false
    }

    if (categoryWords.has(value)) {
      return false
    }

    // Чисті числа тут не потрібні.
    // Ціна, ROM та RAM обробляються окремо.
    if (/^\d+$/.test(value)) {
      return false
    }

    return true
  })



  // --------------------------------------------------
  // Ціна
  // --------------------------------------------------

  const priceFilter: {
    gte?: number
    lte?: number
  } = {}

  if (input.minPrice && input.minPrice > 0) {
    priceFilter.gte = input.minPrice
  }

  if (input.maxPrice && input.maxPrice > 0) {
    priceFilter.lte = input.maxPrice
  }

  // --------------------------------------------------
  // Базовий пошук у БД
  // --------------------------------------------------

  const candidates = await prisma.product.findMany({
    where: {
      AND: [
        // Тільки активні
        {
          active: true
        },

        // Тільки в наявності
        {
          quantity: {
            gt: 0
          }
        },

        // Категорія
        ...(category
          ? [
              {
                category: {
                  equals: category,
                  mode: 'insensitive' as const
                }
              }
            ]
          : []),

        // Ціна
        ...(Object.keys(priceFilter).length > 0
          ? [
              {
                sellPrice: priceFilter
              }
            ]
          : []),

        // Не показувати вже показані товари
        ...(input.excludeProductIds?.length
          ? [
              {
                id: {
                  notIn: input.excludeProductIds
                }
              }
            ]
          : []),

        // Текстовий пошук додаємо ТІЛЬКИ тоді,
        // коли реально є що шукати
        ...(brand || model || productLine || searchTokens.length > 0
          ? [
              {
                OR: [
                  // Бренд
                  ...(brand
                    ? [
                        {
                          brand: {
                            contains: brand,
                            mode: 'insensitive' as const
                          }
                        }
                      ]
                    : []),

                  // Модель
                  ...(model
                    ? [
                        {
                          name: {
                            contains: model,
                            mode: 'insensitive' as const
                          }
                        }
                      ]
                    : []),

                  // Redmi / Poco / Galaxy / iPhone
                  ...(productLine
                    ? [
                        {
                          name: {
                            contains: productLine,
                            mode: 'insensitive' as const
                          }
                        }
                      ]
                    : []),

                  // Інші значущі слова
                  ...searchTokens.map(token => ({
                    name: {
                      contains: token,
                      mode: 'insensitive' as const
                    }
                  }))
                ]
              }
            ]
          : [])
      ]
    },

    take: 50
  })

 

  // --------------------------------------------------
  // Ранжування
  // --------------------------------------------------

  const ranked = candidates
    .map(product => {
      const name = normalizeText(product.name)
      const productBrand = normalizeText(product.brand)

      let score = 0

      // Бренд
      if (brand) {
        if (productBrand.includes(brand.toLowerCase())) {
          score += 10
        } else {
          score -= 20
        }
      }

      // Лінійка
      if (productLine) {
        if (name.includes(productLine.toLowerCase())) {
          score += 20
        }
      }

      // Модель
      if (model) {
        if (name.includes(model.toLowerCase())) {
          score += 30
        } else {
          score -= 100
        }
      }

      // ROM
      if (storage) {
        const storageRegex = new RegExp(
          `(^|[^0-9])${storage}(?:gb|гб)?([^0-9]|$)`,
          'i'
        )

        if (storageRegex.test(name)) {
          score += 20
        } else {
          score -= 50
        }
      }

      // RAM
      if (ram) {
        const ramRegex = new RegExp(
          `(^|[^0-9])${ram}(?:gb|гб)?\\s+(?:${storage ?? '\\d+'})`,
          'i'
        )

        if (ramRegex.test(name)) {
          score += 15
        }
      }

      // Значущі слова
      for (const token of searchTokens) {
        if (name.includes(token.toLowerCase())) {
          score += 1
        }
      }

      return {
        product,
        score
      }
    })
    .sort((a, b) => {
      // Спочатку score
      if (b.score !== a.score) {
        return b.score - a.score
      }

      // При однаковому score — дешевший вище
      return a.product.sellPrice - b.product.sellPrice
    })

  // --------------------------------------------------
  // Фінальна фільтрація
  // --------------------------------------------------

  const results = ranked
    .filter(item => {
      const name = normalizeText(item.product.name)

      // Модель
      if (
        model &&
        !name.includes(model.toLowerCase())
      ) {
        return false
      }

      // Бренд
      if (
        brand &&
        !normalizeText(item.product.brand).includes(
          brand.toLowerCase()
        )
      ) {
        return false
      }

      // Лінійка
      if (
        productLine &&
        !name.includes(productLine.toLowerCase())
      ) {
        return false
      }

      // ROM
      if (storage) {
        const storageRegex = new RegExp(
          `(^|[^0-9])${storage}(?:gb|гб)?([^0-9]|$)`,
          'i'
        )

        if (!storageRegex.test(name)) {
          return false
        }
      }

      return true
    })
    .slice(0, 5)
    .map(item => item.product)



  return results
}