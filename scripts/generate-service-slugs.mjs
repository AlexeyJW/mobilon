import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const transliterate = (text) => {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g',
    д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z',
    и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k',
    л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
    р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'shch', ь: '', ю: 'iu', я: 'ia'
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => map[char] ?? char)
    .join('')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const services = await prisma.service.findMany({
    orderBy: {
      id: 'asc'
    }
  })

  const usedSlugs = new Set()

  for (const service of services) {
    let slug = transliterate(service.name)
    const baseSlug = slug
    let counter = 2

    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    usedSlugs.add(slug)

    await prisma.service.update({
      where: {
        id: service.id
      },
      data: {
        slug
      }
    })

    console.log(`${service.id}: ${service.name} -> ${slug}`)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })