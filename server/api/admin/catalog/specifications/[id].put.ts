import prisma from '../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(
    getRouterParam(event, 'id')
  )

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw createError({
      statusCode: 400,
      message:
        'Некоректний ID характеристики'
    })
  }

  const body =
    await readBody(event)

  const name =
    String(body?.name || '').trim()

  const key =
    String(body?.key || '').trim()

  const type =
    String(body?.type || '').trim()

  const unit =
    body?.unit
      ? String(body.unit).trim()
      : null

  const sortOrder =
    Number(body?.sortOrder || 0)

  const active =
    body?.active === undefined
      ? true
      : Boolean(body.active)

  const allowedTypes = [
    'TEXT',
    'NUMBER',
    'BOOLEAN',
    'SELECT',
    'MULTISELECT'
  ]

  /* ================================================
     VALIDATION
  ================================================ */

  if (!name) {
    throw createError({
      statusCode: 400,
      message:
        'Вкажіть назву характеристики'
    })
  }

  if (!key) {
    throw createError({
      statusCode: 400,
      message:
        'Вкажіть key характеристики'
    })
  }

  if (!allowedTypes.includes(type)) {
    throw createError({
      statusCode: 400,
      message:
        'Некоректний тип характеристики'
    })
  }

  const existing =
    await prisma.specification.findUnique({
      where: {
        id
      }
    })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message:
        'Характеристику не знайдено'
    })
  }

  /* ================================================
     UNIQUE KEY
  ================================================ */

  const keyExists =
    await prisma.specification.findFirst({
      where: {
        key,

        id: {
          not: id
        }
      }
    })

  if (keyExists) {
    throw createError({
      statusCode: 409,
      message:
        'Характеристика з таким key вже існує'
    })
  }

  /* ================================================
     OPTIONS
  ================================================ */

  const rawOptions =
    Array.isArray(body?.options)
      ? body.options
      : []

  const options =
    rawOptions
      .map(
        (option: any, index: number) => ({
          label:
            String(
              option?.label || ''
            ).trim(),

          value:
            String(
              option?.value || ''
            ).trim(),

          sortOrder:
            Number(
              option?.sortOrder ?? index
            )
        })
      )
      .filter(
        (option: any) =>
          option.label &&
          option.value
      )

  /*
    Не дозволяємо дублікати value
  */

  const optionValues =
    options.map(
      (option: any) =>
        option.value
    )

  if (
    new Set(optionValues).size !==
    optionValues.length
  ) {
    throw createError({
      statusCode: 400,
      message:
        'Варіанти не можуть мати однакові value'
    })
  }

  /* ================================================
     UPDATE
  ================================================ */

  try {
    const result =
      await prisma.$transaction(
        async tx => {

          /*
            Оновлюємо саму характеристику
          */

          await tx.specification.update({
            where: {
              id
            },

            data: {
              name,
              key,
              type: type as any,
              unit,
              sortOrder,
              active
            }
          })

          /*
            Варіанти потрібні тільки
            SELECT / MULTISELECT
          */

          if (
            type === 'SELECT' ||
            type === 'MULTISELECT'
          ) {

            /*
              Знаходимо старі options
            */

            const existingOptions =
              await tx.specificationOption
                .findMany({
                  where: {
                    specificationId: id
                  },

                  select: {
                    id: true,
                    value: true
                  }
                })

            /*
              Працюємо по value.

              Якщо option вже існує —
              оновлюємо.

              Якщо нового value немає —
              створюємо.
            */

            for (
              const [index, option]
              of options.entries()
            ) {
              const old =
                existingOptions.find(
                  item =>
                    item.value ===
                    option.value
                )

              if (old) {
                await tx.specificationOption
                  .update({
                    where: {
                      id: old.id
                    },

                    data: {
                      label:
                        option.label,

                      sortOrder:
                        index
                    }
                  })
              }
              else {
                await tx.specificationOption
                  .create({
                    data: {
                      specificationId:
                        id,

                      label:
                        option.label,

                      value:
                        option.value,

                      sortOrder:
                        index
                    }
                  })
              }
            }

          const incomingValues = new Set(
  options.map(
    (option: { value: string }) =>
      option.value
  )
)

const optionsToDelete =
  existingOptions.filter(
    oldOption =>
      !incomingValues.has(oldOption.value)
  )

for (const oldOption of optionsToDelete) {
  const usageCount =
    await tx.productSpecification.count({
      where: {
        optionId: oldOption.id
      }
    })

  if (usageCount > 0) {
    throw createError({
      statusCode: 409,
      message:
        `Не можна видалити варіант "${oldOption.value}", ` +
        `оскільки він використовується у ${usageCount} товар(ах)`
    })
  }

  await tx.specificationOption.delete({
    where: {
      id: oldOption.id
    }
  })
}
          }

          /*
            Якщо тип більше не SELECT,
            старі options теж не видаляємо,
            щоб випадково не втратити дані.
          */

          return tx.specification.findUnique({
            where: {
              id
            },

            include: {
              options: {
                orderBy: {
                  sortOrder: 'asc'
                }
              }
            }
          })
        }
      )

    return result
  }
  catch (error: any) {
    /*
      Наші createError пропускаємо далі
    */

    if (error?.statusCode) {
      throw error
    }

    console.error(
      'SPECIFICATION UPDATE ERROR:',
      error
    )

    throw createError({
      statusCode: 500,
      message:
        'Не вдалося оновити характеристику'
    })
  }
})