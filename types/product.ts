export interface Product {
  id: number

  name: string
  slug: string

  brand: string
  category: string

  shortDescription: string | null
  description: string | null

  buyPrice: number
  sellPrice: number

  quantity: number

  imageUrl: string | null
  imageId: string | null

  isPopular: boolean
  isFeatured: boolean
  isNew: boolean
  isSale: boolean

  active: boolean

  sortOrder: number
  featuredOrder: number

  createdAt: string
  updatedAt: string
}