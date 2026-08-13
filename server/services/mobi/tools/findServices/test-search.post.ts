import { findServices } from '../../tools/findServices/findServices'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const services = await findServices({
    query: String(body?.query || ''),
    minPrice: body?.minPrice,
    maxPrice: body?.maxPrice
  })

  return {
    success: true,
    services
  }
})