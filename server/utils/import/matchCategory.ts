import {
  normalizeProductText,
  tokenizeProductText
} from './normalizeProductText'

interface CategoryLike {
  id: number
  name: string
  slug: string
}

interface ExistingProductLike {
  id: number
  name: string
  brandId: number | null
  categoryId: number | null
  categoryRef: CategoryLike | null
}

interface MatchCategoryOptions {
  productName: string
  supplierCategory?: string | null
  brandId: number | null
  categories: CategoryLike[]
  existingProducts: ExistingProductLike[]
}

function similarity(
  left: string,
  right: string
): number {
  const leftTokens = new Set(
    tokenizeProductText(left)
  )

  const rightTokens = new Set(
    tokenizeProductText(right)
  )

  if (
    leftTokens.size === 0 ||
    rightTokens.size === 0
  ) {
    return 0
  }

  let matches = 0

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      matches++
    }
  }

  return (
    matches /
    Math.max(
      leftTokens.size,
      rightTokens.size
    )
  )
}

function categorySimilarity(
  supplierCategory: string,
  categoryName: string
): number {
  const left =
    normalizeProductText(
      supplierCategory
    )

  const right =
    normalizeProductText(
      categoryName
    )

  if (!left || !right) {
    return 0
  }

  if (left === right) {
    return 1
  }

  if (
    left.includes(right) ||
    right.includes(left)
  ) {
    return 0.95
  }

  const leftTokens = new Set(
    tokenizeProductText(left)
  )

  const rightTokens = new Set(
    tokenizeProductText(right)
  )

  if (
    leftTokens.size === 0 ||
    rightTokens.size === 0
  ) {
    return 0
  }

  let matches = 0

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      matches++
    }
  }

  return (
    matches /
    Math.max(
      leftTokens.size,
      rightTokens.size
    )
  )
}

function matchSupplierCategory(
  supplierCategory:
    | string
    | null
    | undefined,
  categories: CategoryLike[]
) {
  if (!supplierCategory) {
    return null
  }

  const candidates =
    categories
      .map(category => {
        return {
          category,
          score:
            categorySimilarity(
              supplierCategory,
              category.name
            )
        }
      })
      .filter(
        item =>
          item.score >= 0.4
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )

  const best =
    candidates[0]

  if (!best) {
    return null
  }

  return {
    category: best.category,
    confidence: best.score,
    source: 'supplier-category'
  }
}

function matchCategoryByName(
  productName: string,
  categories: CategoryLike[]
) {
  const normalizedName =
    normalizeProductText(
      productName
    )

  const candidates =
    categories
      .map(category => {
        const categoryName =
          normalizeProductText(
            category.name
          )

        let score = 0

        if (
          normalizedName ===
          categoryName
        ) {
          score = 1
        }
        else if (
          normalizedName.includes(
            categoryName
          )
        ) {
          score = 0.93
        }
        else {
          score =
            similarity(
              productName,
              category.name
            ) * 0.8
        }

        return {
          category,
          score
        }
      })
      .filter(
        item =>
          item.score >= 0.55
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )

  const best =
    candidates[0]

  if (!best) {
    return null
  }

  return {
    category: best.category,
    confidence: best.score,
    source: 'product-name'
  }
}

function matchCategoryByExistingProduct(
  productName: string,
  brandId: number | null,
  existingProducts:
    ExistingProductLike[]
) {
  const candidates =
    existingProducts
      .filter(product => {
        if (!product.categoryRef) {
          return false
        }

        if (
          brandId !== null &&
          product.brandId !== null &&
          product.brandId !== brandId
        ) {
          return false
        }

        return true
      })
      .map(product => {
        return {
          product,
          score:
            similarity(
              productName,
              product.name
            )
        }
      })
      .filter(
        item =>
          item.score >= 0.25
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )

  const best =
    candidates[0]

  if (
    !best ||
    !best.product.categoryRef
  ) {
    return null
  }

  const confidence =
    Math.min(
      0.9,
      0.5 +
        best.score * 0.4
    )

  return {
    category:
      best.product.categoryRef,

    confidence,

    source:
      'existing-product',

    matchedProduct: {
      id:
        best.product.id,

      name:
        best.product.name,

      similarity:
        Number(
          best.score.toFixed(3)
        )
    }
  }
}

export function matchCategory(
  options: MatchCategoryOptions
) {
  const {
    productName,
    supplierCategory,
    brandId,
    categories,
    existingProducts
  } = options

  // 1. Категорія з накладної
  const supplierMatch =
    matchSupplierCategory(
      supplierCategory,
      categories
    )

  if (supplierMatch) {
    return {
      category:
        supplierMatch.category,

      confidence:
        supplierMatch.confidence,

      source:
        supplierMatch.source,

      matchedProduct: null
    }
  }

  // 2. Категорія з назви товару
  const nameMatch =
    matchCategoryByName(
      productName,
      categories
    )

  if (nameMatch) {
    return {
      category:
        nameMatch.category,

      confidence:
        nameMatch.confidence,

      source:
        nameMatch.source,

      matchedProduct: null
    }
  }

  // 3. Схожий існуючий товар
  const existingMatch =
    matchCategoryByExistingProduct(
      productName,
      brandId,
      existingProducts
    )

  if (existingMatch) {
    return {
      category:
        existingMatch.category,

      confidence:
        existingMatch.confidence,

      source:
        existingMatch.source,

      matchedProduct:
        existingMatch.matchedProduct
    }
  }

  return {
    category: null,
    confidence: 0,
    source: null,
    matchedProduct: null
  }
}