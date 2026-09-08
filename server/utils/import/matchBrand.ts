import {
  normalizeProductText
} from './normalizeProductText'

interface BrandLike {
  id: number
  name: string
  slug: string
}

export function matchBrand(
  productName: string,
  brands: BrandLike[]
) {
  const normalizedName =
    normalizeProductText(productName)

  /*
    Спочатку точне входження
    назви бренду.
  */

  const matches =
    brands
      .map(brand => {
        const normalizedBrand =
          normalizeProductText(
            brand.name
          )

        let score = 0

        if (
          normalizedName ===
          normalizedBrand
        ) {
          score = 1
        }
        else if (
          normalizedName.startsWith(
            `${normalizedBrand} `
          )
        ) {
          score = 0.98
        }
        else if (
          normalizedName.includes(
            normalizedBrand
          )
        ) {
          score = 0.92
        }

        return {
          brand,
          score
        }
      })
      .filter(item => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score
      )

  const best = matches[0]

  if (!best) {
    return {
      brand: null,
      confidence: 0
    }
  }

  return {
    brand: best.brand,
    confidence: best.score
  }
}