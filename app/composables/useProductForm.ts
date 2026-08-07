export function useProductForm() {
  return {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',

    brand: '',
    category: '',

    buyPrice: 0,
    sellPrice: 0,

    quantity: 0,

    imageUrl: '',
    imageId: '',

    featuredOrder: 0,

    isPopular: false,
    isFeatured: false,
    isNew: false,
    isSale: false,

    active: true
  }
}