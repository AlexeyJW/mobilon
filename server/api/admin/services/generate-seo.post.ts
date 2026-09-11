import requireAdmin from '../../../utils/requireAdmin'
import { generateServiceSeo } from '../../../services/mobi/seo'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const description = String(body?.description || '').trim()

  const category =
    typeof body?.category === 'string'
      ? body.category.trim()
      : ''

  const duration =
    typeof body?.duration === 'string'
      ? body.duration.trim()
      : ''

  const price =
    body?.price !== undefined &&
    body?.price !== null &&
    body?.price !== ''
      ? Number(body.price)
      : undefined

  const priceFrom = Boolean(body?.priceFrom)

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Вкажіть назву послуги'
    })
  }

  if (
    price !== undefined &&
    (!Number.isFinite(price) || price < 0)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректна ціна'
    })
  }

  const seo = await generateServiceSeo({
    name,
    description,
    category,
    price,
    priceFrom,
    duration
  })

  return {
    success: true,
    seo
  }
})