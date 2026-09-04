const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function test(product) {
  const text = normalizeText(
    `${product.shortDescription || ''} ${product.description || ''}`
  )

  const checks = {
    'Діагональ': /(\d+(?:[,.]\d+)?)\s*["”″]/i,
    'Тип дисплея': /\b(AMOLED|OLED|IPS|PLS|TFT)\b/i,
    'Роздільна здатність': /(\d{3,5}\s*[xх×]\s*\d{3,5})/i,
    'Частота оновлення': /(\d{2,3})\s*Гц/i,

    'Оперативна памʼять': /(?:ОЗП|Оперативна\s*пам'?ять|RAM)\s*:?\s*(\d+(?:[,.]\d+)?)\s*ГБ/i,

    'Вбудована памʼять': /(?:Пам'?ять|Память|Storage)\s*:?\s*(\d+(?:[,.]\d+)?)\s*ГБ/i,

    'Процесор': /Процесор\s*:/i,

    'Операційна система': /ОС\s*:/i,

    'Акумулятор': /(?:Акумулятор|Батарея)\s*:?\s*(\d{3,5})\s*мА/i,

    'Основна камера': /Камера\s*:?\s*(\d+(?:[,.]\d+)?)\s*Мп/i,

    'Фронтальна камера':
      /(?:Фронтальна|Передня)\s*(?:камера)?\s*:?\s*(\d+(?:[,.]\d+)?)\s*Мп/i,

    'Потужність зарядки':
      /(?:зарядк[аи]|заряджанн[яі]|потужність зарядки)\s*:?\s*(\d+(?:[,.]\d+)?)\s*Вт/i,

    'NFC':
      /\bNFC\b\s*:?\s*([+−\-]|так|є|немає|ні)/i,

    '5G':
      /\b5G\b/i,

    'SIM':
      /(?:SIM|сім)\s*:?\s*\d/i,

    'microSD':
      /(?:microSD|micro\s*SD)\s*:?\s*([+−\-]|так|є|немає|ні)/i,

    'Колір':
      /(?:Колір|Цвет)\s*:/i
  }

  console.log('\n' + '='.repeat(80))
  console.log(`ТОВАР: ${product.name.trim()}`)
  console.log('='.repeat(80))

  console.log('\nОПИС:')
  console.log(text || '(порожній)')

  console.log('\nРЕЗУЛЬТАТ:')

  for (const [name, regex] of Object.entries(checks)) {
    const match = text.match(regex)

    if (match) {
      console.log(`✓ ${name}${match[1] ? ` → ${match[1]}` : ''}`)
    } else {
      console.log(`✗ ${name}`)
    }
  }
}

async function main() {
  const category = await prisma.category.findFirst({
    where: {
      name: 'Смартфони'
    }
  })

  if (!category) {
    throw new Error('Категорію "Смартфони" не знайдено')
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id
    },
    orderBy: {
      id: 'asc'
    }
  })

  console.log(`Знайдено товарів: ${products.length}`)

  for (const product of products) {
    test(product)
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })