const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('🚀 Починаємо перенесення брендів і категорій...\n')

  // =========================================================
  // 1. БРЕНДИ
  // =========================================================

  const products = await prisma.product.findMany({
    select: {
      id: true,
      brand: true,
      category: true
    }
  })

  const brands = [
    ...new Set(
      products
        .map(p => p.brand?.trim())
        .filter(Boolean)
    )
  ]

  console.log(`Знайдено брендів: ${brands.length}`)

  for (const brandName of brands) {
    const slug = slugify(brandName)

    const brand = await prisma.brand.upsert({
      where: {
        slug
      },
      update: {
        name: brandName
      },
      create: {
        name: brandName,
        slug
      }
    })

    await prisma.product.updateMany({
      where: {
        brand: brandName,
        brandId: null
      },
      data: {
        brandId: brand.id
      }
    })

    console.log(`  ✓ Бренд: ${brandName}`)
  }

  // =========================================================
  // 2. КАТЕГОРІЇ
  // =========================================================

  const categories = [
    ...new Set(
      products
        .map(p => p.category?.trim())
        .filter(Boolean)
    )
  ]

  console.log(`\nЗнайдено категорій: ${categories.length}`)

  for (const categoryName of categories) {
    const slug = slugify(categoryName)

    const category = await prisma.category.upsert({
      where: {
        slug
      },
      update: {
        name: categoryName
      },
      create: {
        name: categoryName,
        slug
      }
    })

    await prisma.product.updateMany({
      where: {
        category: categoryName,
        categoryId: null
      },
      data: {
        categoryId: category.id
      }
    })

    console.log(`  ✓ Категорія: ${categoryName}`)
  }

  // =========================================================
  // 3. ПЕРЕВІРКА
  // =========================================================

  const totalProducts = await prisma.product.count()

  const linkedBrands = await prisma.product.count({
    where: {
      brandId: {
        not: null
      }
    }
  })

  const linkedCategories = await prisma.product.count({
    where: {
      categoryId: {
        not: null
      }
    }
  })

  console.log('\n========================================')
  console.log('✅ ПЕРЕНЕСЕННЯ ЗАВЕРШЕНО')
  console.log('========================================')
  console.log(`Товарів всього:        ${totalProducts}`)
  console.log(`Товарів з brandId:     ${linkedBrands}`)
  console.log(`Товарів з categoryId:  ${linkedCategories}`)
  console.log('========================================\n')
}

main()
  .catch(error => {
    console.error('\n❌ Помилка:')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })