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

  const product = await prisma.product.update({
    where: {
      id: 13
    },
    data: {
      categoryId: category.id,
      category: 'Смартфони'
    }
  })

  console.log('✅ Товар оновлено:')
  console.log(product)
}

main()
  .catch((error) => {
    console.error('❌ Помилка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })