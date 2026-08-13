import { findServices } from '../../../services/mobi/tools/findServices/findServices'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  console.log('TEST SEARCH BODY:', body)

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