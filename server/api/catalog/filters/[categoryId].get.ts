import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const categoryId = Number(
    getRouterParam(event, 'categoryId')
  )

  if (!categoryId || Number.isNaN(categoryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некоректний ID категорії'
    })
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId
    },

    include: {
    specifications: {
  where: {
    filterable: true
  },
  orderBy: {
    sortOrder: 'asc'
  },
  include: {
    specification: {
      include: {
        options: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    }
  }
} 
    }
  })

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Категорію не знайдено'
    })
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId,
      active: true
    },

    select: {
      id: true,

      specifications: {
        select: {
          specificationId: true,
          valueText: true,
          valueNumber: true,
          valueBoolean: true,

          option: {
            select: {
              id: true,
              label: true,
              value: true
            }
          }
        }
      }
    }
  })

  const filters = category.specifications.map(
    categorySpecification => {
      const specification =
        categorySpecification.specification

      const productValues = products.flatMap(product =>
        product.specifications.filter(
          item =>
            item.specificationId === specification.id
        )
      )

      // SELECT
      if (specification.type === 'SELECT') {
        const usedValues = new Set(
          productValues
            .map(item => item.option?.value)
            .filter(Boolean)
        )

        const options = specification.options
          .filter(option =>
            usedValues.has(option.value)
          )
          .map(option => ({
            label: option.label,
            value: option.value
          }))

        return {
          id: specification.id,
          key: specification.key,
          name: specification.name,
          type: specification.type,
          unit: specification.unit,
          options
        }
      }

      // NUMBER
      if (specification.type === 'NUMBER') {
        const values = [
          ...new Set(
            productValues
              .map(item => item.valueNumber)
              .filter(
                (value): value is number =>
                  value !== null
              )
          )
        ].sort((a, b) => a - b)

        return {
          id: specification.id,
          key: specification.key,
          name: specification.name,
          type: specification.type,
          unit: specification.unit,

          options: values.map(value => ({
            label: specification.unit
              ? `${value} ${specification.unit}`
              : String(value),
            value
          }))
        }
      }

      // TEXT
      if (specification.type === 'TEXT') {
        const values = [
          ...new Set(
            productValues
              .map(item => item.valueText)
              .filter(
                (value): value is string =>
                  value !== null && value !== ''
              )
          )
        ].sort()

        return {
          id: specification.id,
          key: specification.key,
          name: specification.name,
          type: specification.type,
          unit: specification.unit,

          options: values.map(value => ({
            label: value,
            value
          }))
        }
      }

      // BOOLEAN
      if (specification.type === 'BOOLEAN') {
        const options: {
          label: string
          value: boolean
        }[] = []

        if (
          productValues.some(
            item => item.valueBoolean === true
          )
        ) {
          options.push({
            label: 'Так',
            value: true
          })
        }

        if (
          productValues.some(
            item => item.valueBoolean === false
          )
        ) {
          options.push({
            label: 'Ні',
            value: false
          })
        }

        return {
          id: specification.id,
          key: specification.key,
          name: specification.name,
          type: specification.type,
          unit: specification.unit,
          options
        }
      }

      return {
        id: specification.id,
        key: specification.key,
        name: specification.name,
        type: specification.type,
        unit: specification.unit,
        options: []
      }
    }
  )

  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug
    },

    filters: filters.filter(
      filter => filter.options.length > 0
    )
  }
})