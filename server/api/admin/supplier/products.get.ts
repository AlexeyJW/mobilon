import { dclinkRequest } from '~~/server/api/sync/dclink/api'

export default defineEventHandler(async () => {
  const products = await dclinkRequest('GetRefItems')

  return {
    success: true,
    products
  }
})