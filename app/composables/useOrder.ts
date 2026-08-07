import { watch } from 'vue'
import type { Product } from '../../types'

export const useOrder = () => {
  const open = useState<boolean>('order-open', () => false)

  const product = useState<Product | null>('order-product', () => null)

  const quantity = useState<number>('order-quantity', () => 1)

  const customer = useState('order-customer', () => ({
    name: '',
    phone: '',
    comment: ''
  }))

  function updateComment() {
    if (!product.value) {
      customer.value.comment = ''
      return
    }

    customer.value.comment = `Хочу замовити

${product.value.name}

Кількість: ${quantity.value}`
  }

  watch(quantity, () => {
    updateComment()
  })

  function show(productData?: Product) {
    
    if (productData) {
      product.value = productData
      quantity.value = 1
      updateComment()
    }

    open.value = true
  }

  function hide() {
    open.value = false
  }

  function reset() {
    product.value = null

    quantity.value = 1

    customer.value = {
      name: '',
      phone: '',
      comment: ''
    }
  }

return {
  open,
  product,
  quantity,
  customer,
  show,
  hide,
  reset
}
}