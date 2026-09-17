import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/*
 * ВАЖЛИВО:
 * Сюди вписуємо ТІЛЬКИ телефони тестових клієнтів.
 * Реальних клієнтів сюди не додавати.
 *
 * Формат телефону такий, як він зберігається в БД:
 * 380XXXXXXXXX
 */
const testPhones = [
  '380971234567',
  
  // '380XXXXXXXXX'
]

async function main() {
  if (testPhones.length === 0) {
    console.log('Список тестових телефонів порожній.')
    return
  }

  const customers = await prisma.customer.findMany({
    where: {
      phone: {
        in: testPhones
      }
    },
    select: {
      id: true,
      name: true,
      phone: true
    }
  })

  if (customers.length === 0) {
    console.log('Тестових клієнтів не знайдено.')
    return
  }

  console.log('Будуть видалені:')

  for (const customer of customers) {
    console.log(
      `#${customer.id} ${customer.name} (${customer.phone})`
    )
  }

  const customerIds = customers.map(
    customer => customer.id
  )

  await prisma.$transaction(async tx => {
    /*
     * Спочатку бонусні операції.
     * Вони посилаються і на Customer, і на Purchase.
     */
    const bonusResult =
      await tx.bonusTransaction.deleteMany({
        where: {
          customerId: {
            in: customerIds
          }
        }
      })

    /*
     * Тепер покупки.
     *
     * PurchaseLine видаляться автоматично,
     * тому що там onDelete: Cascade.
     */
    const purchaseResult =
      await tx.purchase.deleteMany({
        where: {
          customerId: {
            in: customerIds
          }
        }
      })

    /*
     * Якщо заявки Request пов'язані
     * з тестовими клієнтами, не видаляємо їх,
     * а просто відв'язуємо.
     */
    await tx.request.updateMany({
      where: {
        customerId: {
          in: customerIds
        }
      },
      data: {
        customerId: null
      }
    })

    /*
     * І лише тепер видаляємо клієнтів.
     */
    const customerResult =
      await tx.customer.deleteMany({
        where: {
          id: {
            in: customerIds
          }
        }
      })

    console.log('')
    console.log('Очищення завершено:')
    console.log(
      `Бонусних операцій: ${bonusResult.count}`
    )
    console.log(
      `Покупок: ${purchaseResult.count}`
    )
    console.log(
      `Клієнтів: ${customerResult.count}`
    )
  })
}

main()
  .catch(error => {
    console.error('Помилка очищення:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })