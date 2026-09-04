const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      category: 'Смартфони'
    },
    include: {
      specifications: {
        include: {
          specification: true,
          option: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  })

  console.log('')
  console.log('============================================================')
  console.log('          ПЕРЕВІРКА ХАРАКТЕРИСТИК СМАРТФОНІВ')
  console.log('============================================================')
  console.log('')
  console.log(`Знайдено смартфонів: ${products.length}`)
  console.log('')

  let totalSpecs = 0

  for (const product of products) {
    console.log('')
    console.log('────────────────────────────────────────────────────────────')
    console.log(`ТОВАР #${product.id}: ${product.name}`)
    console.log('────────────────────────────────────────────────────────────')

    if (!product.specifications.length) {
      console.log('  ⚠ Характеристик немає')
      continue
    }

    // Сортуємо за sortOrder характеристики
    const specs = [...product.specifications].sort(
      (a, b) =>
        a.specification.sortOrder - b.specification.sortOrder
    )

    for (const item of specs) {
      const spec = item.specification

      let value = ''

      if (item.option) {
        value = item.option.label
      } else if (item.valueNumber !== null) {
        value = String(item.valueNumber)

        if (spec.unit) {
          value += ` ${spec.unit}`
        }
      } else if (item.valueBoolean !== null) {
        value = item.valueBoolean
          ? 'Так'
          : 'Ні'
      } else if (item.valueText !== null) {
        value = item.valueText
      } else {
        value = '—'
      }

      console.log(
        `  ${spec.name.padEnd(24)} → ${value}`
      )

      totalSpecs++
    }

    console.log(
      `\n  Всього: ${product.specifications.length} характеристик`
    )
  }

  console.log('')
  console.log('============================================================')
  console.log('ПІДСУМОК')
  console.log('============================================================')
  console.log(`Товарів:       ${products.length}`)
  console.log(`Характеристик: ${totalSpecs}`)
  console.log('============================================================')
  console.log('')
}

main()
  .catch(error => {
    console.error('')
    console.error('ПОМИЛКА:')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })