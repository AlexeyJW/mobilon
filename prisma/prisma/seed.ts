import prisma from '../../server/utils/prisma'

const categories = [
  'Перенесення даних',
  'Налаштування смартфона',
  'Оптимізація',
  'Акаунти',
  'Активація додатків',
  'Заміна сім-карти',
  'Заміна батареї',
  'Заміна дисплея',
  'Копії документів',
  'Ремонт',
  'Інше',
  
]

async function main() {
  for (const name of categories) {
    await prisma.serviceCategory.upsert({
      where: { name },
      update: {},
      create: {
        name,
        active: true
      }
    })
  }

  console.log('Категорії створено')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })