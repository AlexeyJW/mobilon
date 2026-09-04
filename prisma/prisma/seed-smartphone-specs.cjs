const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const category = await prisma.category.findFirst({
  where: {
    name: 'Смартфони'
  }
})

  if (!category) {
    throw new Error('Категорію "Смартфони" не знайдено')
  }

  const specifications = [
    {
      name: 'Діагональ',
      key: 'display_size',
      type: 'NUMBER',
      unit: 'дюйм',
      sortOrder: 10,
      required: false
    },
    {
      name: 'Тип дисплея',
      key: 'display_type',
      type: 'SELECT',
      unit: null,
      sortOrder: 20,
      required: false,
      options: [
        ['AMOLED', 'amoled'],
        ['OLED', 'oled'],
        ['IPS', 'ips'],
        ['PLS', 'pls'],
        ['TFT', 'tft']
      ]
    },
    {
      name: 'Роздільна здатність',
      key: 'resolution',
      type: 'TEXT',
      unit: null,
      sortOrder: 30,
      required: false
    },
    {
      name: 'Частота оновлення',
      key: 'refresh_rate',
      type: 'NUMBER',
      unit: 'Гц',
      sortOrder: 40,
      required: false
    },
    {
      name: 'Оперативна памʼять',
      key: 'ram',
      type: 'NUMBER',
      unit: 'ГБ',
      sortOrder: 50,
      required: false
    },
    {
      name: 'Вбудована памʼять',
      key: 'storage',
      type: 'NUMBER',
      unit: 'ГБ',
      sortOrder: 60,
      required: false
    },
    {
      name: 'Процесор',
      key: 'processor',
      type: 'TEXT',
      unit: null,
      sortOrder: 70,
      required: false
    },
    {
      name: 'Операційна система',
      key: 'os',
      type: 'TEXT',
      unit: null,
      sortOrder: 80,
      required: false
    },
    {
      name: 'Ємність акумулятора',
      key: 'battery',
      type: 'NUMBER',
      unit: 'мА·год',
      sortOrder: 90,
      required: false
    },
    {
      name: 'Основна камера',
      key: 'main_camera',
      type: 'NUMBER',
      unit: 'Мп',
      sortOrder: 100,
      required: false
    },
    {
      name: 'Фронтальна камера',
      key: 'front_camera',
      type: 'NUMBER',
      unit: 'Мп',
      sortOrder: 110,
      required: false
    },
    {
      name: 'Потужність зарядки',
      key: 'charging_power',
      type: 'NUMBER',
      unit: 'Вт',
      sortOrder: 120,
      required: false
    },
    {
      name: 'NFC',
      key: 'nfc',
      type: 'BOOLEAN',
      unit: null,
      sortOrder: 130,
      required: false
    },
    {
      name: '5G',
      key: '5g',
      type: 'BOOLEAN',
      unit: null,
      sortOrder: 140,
      required: false
    },
    {
      name: 'Кількість SIM',
      key: 'sim_count',
      type: 'NUMBER',
      unit: 'SIM',
      sortOrder: 150,
      required: false
    },
    {
      name: 'microSD',
      key: 'microsd',
      type: 'BOOLEAN',
      unit: null,
      sortOrder: 160,
      required: false
    },
    {
      name: 'Колір',
      key: 'color',
      type: 'TEXT',
      unit: null,
      sortOrder: 170,
      required: false
    }
  ]

  for (const specData of specifications) {
    const { options, required, ...specFields } = specData

    const specification = await prisma.specification.upsert({
      where: {
        key: specFields.key
      },
      update: {
        name: specFields.name,
        type: specFields.type,
        unit: specFields.unit,
        sortOrder: specFields.sortOrder,
        active: true
      },
      create: {
        ...specFields
      }
    })

    await prisma.categorySpecification.upsert({
      where: {
        categoryId_specificationId: {
          categoryId: category.id,
          specificationId: specification.id
        }
      },
      update: {
        required,
        sortOrder: specData.sortOrder
      },
      create: {
        categoryId: category.id,
        specificationId: specification.id,
        required,
        sortOrder: specData.sortOrder
      }
    })

    if (options) {
      for (let i = 0; i < options.length; i++) {
        const [label, value] = options[i]

        await prisma.specificationOption.upsert({
          where: {
            specificationId_value: {
              specificationId: specification.id,
              value
            }
          },
          update: {
            label,
            sortOrder: i
          },
          create: {
            specificationId: specification.id,
            label,
            value,
            sortOrder: i
          }
        })
      }
    }

    console.log(`✓ ${specification.name}`)
  }

  console.log('\nГотово!')
  console.log(`Категорія: ${category.name}`)
  console.log(`Створено/оновлено характеристик: ${specifications.length}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })