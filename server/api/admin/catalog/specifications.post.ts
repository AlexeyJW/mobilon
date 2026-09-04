import prisma from '../../../utils/prisma'
import slugify from 'slugify'

const allowedTypes = [
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'SELECT',
  'MULTISELECT'
] as const

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body.name || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Вкажіть назву характеристики'
    })
  }

  const type = String(
    body.type || ''
  ).toUpperCase()

  if (!allowedTypes.includes(type as any)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Некоректний тип характеристики'
    })
  }

  let key = String(
    body.key || ''
  ).trim()

  if (!key) {
    key = slugify(name, {
      lower: true,
      strict: true,
      locale: 'uk'
    })
      .replace(/-/g, '_')
  }

  const existing =
    await prisma.specification.findUnique({
      where: {
        key
      }
    })

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Характеристика з таким key вже існує'
    })
  }

  const options = Array.isArray(body.options)
    ? body.options
    : []

  return prisma.specification.create({
    data: {
      name,
      key,

      type: type as
        | 'TEXT'
        | 'NUMBER'
        | 'BOOLEAN'
        | 'SELECT'
        | 'MULTISELECT',

      unit: body.unit
        ? String(body.unit).trim()
        : null,

      sortOrder: Number(body.sortOrder || 0),

      active:
        body.active === undefined
          ? true
          : Boolean(body.active),

      options: {
        create:
          type === 'SELECT' ||
          type === 'MULTISELECT'
            ? options
                .filter((option: any) =>
                  String(
                    option.label || option.value || ''
                  ).trim()
                )
                .map(
                  (
                    option: any,
                    index: number
                  ) => {
                    const label = String(
                      option.label ||
                      option.value
                    ).trim()

                    const value = String(
                      option.value ||
                      slugify(label, {
                        lower: true,
                        strict: true,
                        locale: 'uk'
                      })
                    ).trim()

                    return {
                      label,
                      value,
                      sortOrder:
                        option.sortOrder !== undefined
                          ? Number(
                              option.sortOrder
                            )
                          : index
                    }
                  }
                )
            : []
      }
    },

    include: {
      options: {
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })
})