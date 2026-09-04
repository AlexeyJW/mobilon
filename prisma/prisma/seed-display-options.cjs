const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const specification = await prisma.specification.findUnique({
    where: {
      key: 'display_type'
    }
  })

  if (!specification) {
    throw new Error('Характеристика display_type не знайдена')
  }

  const options = [
    'AMOLED',
    'Super AMOLED',
    'Dynamic AMOLED',
    'OLED',
    'IPS',
    'IPS LCD',
    'PLS',
    'LCD',
    'TFT'
  ]

  for (let i = 0; i < options.length; i++) {
    const label = options[i]

    await prisma.specificationOption.upsert({
      where: {
        specificationId_value: {
          specificationId: specification.id,
          value: label
        }
      },
      update: {
        label,
        sortOrder: i
      },
      create: {
        specificationId: specification.id,
        label,
        value: label,
        sortOrder: i
      }
    })
  }

  console.log('Готово!')
  console.log(`Додано/оновлено варіантів: ${options.length}`)
}

main()
  .catch(error => {
    console.error('ПОМИЛКА:')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })