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

function extractModel(tokens: string[]) {
  return (
    tokens.find(token =>
      /^[a-z]+\d+[a-z]*$/i.test(token)
    ) ?? null
  )
}

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
export async function findProducts(input: FindProductsInput) {
  const query = normalizeQuery(input.query)

  console.log('Original query:', input.query)
  console.log('Normalized query:', query)
  console.log('Price range:', input.minPrice, input.maxPrice)

  const normalizedQuery = normalizeText(query)

  const tokens = normalizedQuery
    .split(/\s+/)
    .filter(Boolean)

  const brand = extractBrand(tokens)

  const productLine = extractProductLine(tokens)
  console.log('Detected product line:', productLine)
  const model = extractModel(tokens)
  const storage = extractStorage(normalizedQuery)
  const ram = extractRam(normalizedQuery)

  console.log('Search tokens:', tokens)
  console.log('Detected brand:', brand)
  console.log('Detected model:', model)
  console.log('Detected RAM:', ram)
  console.log('Detected storage:', storage)
console.log('Exclude product IDs:', input.excludeProductIds)
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
  // Базовий пошук
  // --------------------------------------------------

  const candidates = await prisma.product.findMany({
    where: {
      AND: [
        {
          active: true
        },

        {
          quantity: {
            gt: 0
          }
        },

        ...(Object.keys(priceFilter).length > 0
          ? [
              {
                sellPrice: priceFilter
              }
            ]
          : []),

        ...(input.excludeProductIds?.length
          ? [
              {
                id: {
                  notIn: input.excludeProductIds
                }
              }
            ]
          : []),

        {
          OR: [
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

            ...tokens.map(token => ({
              name: {
                contains: token,
                mode: 'insensitive' as const
              }
            }))
          ]
        }
      ]
    },

    take: 50
  })

  console.log('Candidates found:', candidates.length)

  // --------------------------------------------------
  // Ранжування
  // --------------------------------------------------

  const ranked = candidates
    .map(product => {
      const name = normalizeText(product.name)
      const productBrand = normalizeText(product.brand)

      let score = 0

      // ----------------------------------------------
      // Бренд
      // ----------------------------------------------

      if (brand) {
        if (productBrand.includes(brand)) {
          score += 10
        } else {
          score -= 20
        }
      }
      
      // ----------------------------------------------
      // Модель
      // ----------------------------------------------

      if (model) {
        if (name.includes(model.toLowerCase())) {
          score += 30
        } else {
          score -= 100
        }
      }

      // ----------------------------------------------
      // Пам'ять ROM
      // ----------------------------------------------

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

      // ----------------------------------------------
      // RAM
      // ----------------------------------------------

      if (ram) {
        const ramRegex = new RegExp(
          `(^|[^0-9])${ram}(?:gb|гб)?\\s+(?:${storage ?? '\\d+'})`,
          'i'
        )

        if (ramRegex.test(name)) {
          score += 15
        }
      }

      // ----------------------------------------------
      // Окремі слова
      // ----------------------------------------------

      for (const token of tokens) {
        if (name.includes(token)) {
          score += 1
        }
      }

      // ----------------------------------------------
      // Повний збіг
      // ----------------------------------------------

      if (name.includes(normalizedQuery)) {
        score += 20
      }

      return {
        product,
        score
      }
    })
    .sort((a, b) => b.score - a.score)

  console.log(
    'Ranking:',
    ranked.map(item => ({
      id: item.product.id,
      name: item.product.name,
      score: item.score
    }))
  )

  // --------------------------------------------------
  // Фінальна фільтрація
  // --------------------------------------------------

  const results = ranked
  .filter(item => {
    const name = normalizeText(item.product.name)

    if (
      model &&
      !name.includes(model.toLowerCase())
    ) {
      return false
    }

    if (
      brand &&
      !normalizeText(item.product.brand).includes(brand)
    ) {
      return false
    }

    if (
      productLine &&
      !name.includes(productLine)
    ) {
      return false
    }

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
  console.log(
    'Final products:',
    results.map(product => ({
      id: product.id,
      name: product.name
    }))
  )

  return results
}