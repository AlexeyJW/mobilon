import prisma from '../../../utils/prisma'
import requireAdmin from '../../../utils/requireAdmin'

function createSlug(text: string) {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'h',
    ґ: 'g',
    д: 'd',
    е: 'e',
    є: 'ie',
    ж: 'zh',
    з: 'z',
    и: 'y',
    і: 'i',
    ї: 'i',
    й: 'i',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ь: '',
    ю: 'iu',
    я: 'ia'
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => map[char] ?? char)
    .join('')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}




export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)


  const name = String(body?.name || '').trim()
  const description = String(body?.description || '').trim()

  const seoText = String(body?.seoText || '').trim()
  const duration = String(body?.duration || '').trim()
  const whatIncluded = String(body?.whatIncluded || '').trim()
  const metaTitle = String(body?.metaTitle || '').trim()
  const metaDescription = String(body?.metaDescription || '').trim()


  const image =
    typeof body?.image === 'string' &&
    body.image.trim()
      ? body.image.trim()
      : null
  const categoryId =
    body?.categoryId !== null &&
    body?.categoryId !== undefined &&
    body?.categoryId !== ''
      ? Number(body.categoryId)
      : null

  const price = Number(body?.price)
  const priceFrom = Boolean(body?.priceFrom)

  const sortOrder =
    body?.sortOrder !== undefined &&
    body?.sortOrder !== ''
      ? Number(body.sortOrder)
      : 0
 
      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid sort order'
        })
      }


  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
    })
  }
let slug = createSlug(name)

if (!slug) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Не вдалося створити slug'
  })
}

const baseSlug = slug
let counter = 2

while (
  await prisma.service.findUnique({
    where: {
      slug
    },
    select: {
      id: true
    }
  })
) {
  slug = `${baseSlug}-${counter}`
  counter++
}
  if (!Number.isFinite(price) || price < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid price'
    })
  }

  if (
    categoryId !== null &&
    (!Number.isInteger(categoryId) || categoryId <= 0)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid category'
    })
  }

  if (categoryId !== null) {
    const category = await prisma.serviceCategory.findUnique({
      where: {
        id: categoryId
      }
    })

    if (!category || !category.active) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category not found or inactive'
      })
    }
  }

  const service = await prisma.service.create({
data: {
  name,
  slug,
  description: description || null,
  seoText: seoText || null,
  duration: duration || null,
  whatIncluded: whatIncluded || null,
  metaTitle: metaTitle || null,
  metaDescription: metaDescription || null,
  image,
  categoryId,
  price,
  priceFrom,
  sortOrder,
  active: true
},
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      seoText: true,
      duration: true,
      whatIncluded: true,
      metaTitle: true,
      metaDescription: true,
      price: true,
      image: true,
      priceFrom: true,
      sortOrder: true,
      categoryId: true,
      categoryRef: {
        select: {
          id: true,
          name: true
        }
      },
      active: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return {
    success: true,
    service
  }
})