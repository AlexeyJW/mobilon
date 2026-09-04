const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value) {
  return String(value || '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function numberValue(value) {
  if (value == null) return null

  const normalized = String(value)
    .replace(',', '.')
    .replace(/\s/g, '')

  const match = normalized.match(/\d+(?:\.\d+)?/)

  return match ? Number(match[0]) : null
}

function upsertSpec(map, key, value) {
  if (value === null || value === undefined || value === '') return

  map[key] = value
}

/* =========================================================
   DISPLAY
========================================================= */

function parseDisplaySize(text) {
  const patterns = [
    /(?:діагональ(?:\s+дисплея)?|екран)?\s*:?\s*(\d+(?:[.,]\d+)?)\s*(?:"|″|”|''|′)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:"|″|”|''|′)/i
  ]

  for (const regex of patterns) {
    const match = text.match(regex)

    if (match) {
      return numberValue(match[1])
    }
  }

  return null
}

function parseDisplayType(text) {
  const normalized = normalizeText(text).toLowerCase()

  if (normalized.includes('superamoled') || normalized.includes('super amoled')) {
    return 'Super AMOLED'
  }

  if (normalized.includes('dynamic amoled')) {
    return 'Dynamic AMOLED'
  }

  if (normalized.includes('amoled')) {
    return 'AMOLED'
  }

  if (normalized.includes('oled')) {
    return 'OLED'
  }

  if (normalized.includes('ips lcd')) {
    return 'IPS LCD'
  }

  if (normalized.includes('ips')) {
    return 'IPS'
  }

  if (normalized.includes('pls')) {
    return 'PLS'
  }

  if (normalized.includes('tft')) {
    return 'TFT'
  }

  if (normalized.includes('lcd')) {
    return 'LCD'
  }

  return null
}

function parseResolution(text) {
  const match = text.match(
    /(\d{3,4})\s*[xх×]\s*(\d{3,4})/i
  )

  if (!match) return null

  return `${match[1]}x${match[2]}`
}

function parseRefreshRate(text) {
  const match = text.match(
    /(\d{2,3})\s*Гц/i
  )

  return match ? numberValue(match[1]) : null
}

/* =========================================================
   MEMORY
========================================================= */

function parseRam(text, name) {
  const patterns = [
    /ОЗП\s*:?\s*(\d+)\s*ГБ/i,
    /оперативн(?:а|ої)\s*пам'?ят[іi]?\s*:?\s*(\d+)\s*ГБ/i,
    /\b(\d+)\s*ГБ\s*ОЗП\b/i
  ]

  for (const regex of patterns) {
    const match = text.match(regex)

    if (match) {
      return numberValue(match[1])
    }
  }

  // fallback із назви: 8/256, 4/128 тощо
  const nameMatch = name.match(
    /\b(\d+)\s*\/\s*(\d+)\s*(?:GB|Gb|ГБ)?\b/i
  )

  return nameMatch ? numberValue(nameMatch[1]) : null
}

function parseStorage(text, name) {
  const patterns = [
    /Пам'ять\s*:?\s*(\d+)\s*ГБ/i,
    /Пам’ять\s*:?\s*(\d+)\s*ГБ/i,
    /(\d+)\s*ГБ\s*вбудован(?:ої|ої\s+пам'яті)/i,
    /(\d+)\s*ГБ\s*вбудованої/i,
    /(\d+)\s*ГБ\s*пам'ят[іi]/i
  ]

  for (const regex of patterns) {
    const match = text.match(regex)

    if (match) {
      return numberValue(match[1])
    }
  }

  // fallback із назви
  const nameMatch = name.match(
    /\b(\d+)\s*\/\s*(\d+)\s*(?:GB|Gb|ГБ)?\b/i
  )

  return nameMatch ? numberValue(nameMatch[2]) : null
}

/* =========================================================
   PROCESSOR
========================================================= */

function parseProcessor(text) {
  // Варіант: "Процесор: MediaTek Helio G100 Ultra"
  const explicit = text.match(
    /(?:Модель\s+процесора|Процесор)\s*:?\s*([^\n;\/]+?)(?=\s*\/|\s*,?\s*ОЗ[ПУ]|\s*,?\s*ОС|\s*Акумулятор|\s*Камера|\s*Ємність|\s*Основна\s+камера|\s*NFC|$)/i
  )

  if (explicit) {
    return explicit[1]
      .trim()
      .replace(/[,\s]+$/, '')
  }

  // Варіант:
  // "... / MediaTek Helio G99 / ОЗП 4 ГБ / ..."
  // "... / Qualcomm Snapdragon 6 Gen 3 / ОЗП 6 ГБ / ..."
  const slash = text.match(
    /\/\s*((?:MediaTek|Qualcomm|Snapdragon|Exynos|Unisoc|UNISOC|Apple|Helio|Dimensity|Tensor|Kirin|Tiger|Spreadtrum)[^\/\n]*?)\s*\/\s*(?=(?:ОЗП|ОЗУ|RAM|Пам'ять|Пам’ять)\b)/i
  )

  if (slash) {
    return slash[1].trim()
  }

  return null
}
/* =========================================================
   OS
========================================================= */

function parseOS(text) {
  const match = text.match(
    /ОС\s*:?\s*(Android\s*[\d.]+|iOS\s*[\d.]*)/i
  )

  if (!match) return null

  return match[1].trim()
}

/* =========================================================
   BATTERY
========================================================= */

function parseBattery(text) {
  const patterns = [
    /(?:Акумулятор|Ємність\s+акумулятора|Батарея)\s*:?\s*(\d{3,5})\s*(?:мА·год|мАг|мА\s*год)/i,
    /(\d{3,5})\s*(?:мА·год|мАг|мА\s*год)/i
  ]

  for (const regex of patterns) {
    const match = text.match(regex)

    if (match) {
      return numberValue(match[1])
    }
  }

  return null
}

/* =========================================================
   CAMERAS
========================================================= */

function parseMainCamera(text) {
  const patterns = [
    /(?:Основна\s+камера|Камера)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(?:Мп)?/i,

    /(?:камера)\s+(\d+(?:[.,]\d+)?)\s*(?:\+|Мп)/i
  ]

  for (const regex of patterns) {
    const match = text.match(regex)

    if (match) {
      return numberValue(match[1])
    }
  }

  return null
}

function parseFrontCamera(text) {
  const match = text.match(
    /(?:^|[;\/])\s*(?:камера|Камера)\s*:?\s*[^;\/]*?(\d+(?:[.,]\d+)?)\s*Мп\s*\+\s*(\d+(?:[.,]\d+)?)\s*Мп/i
  )

  if (!match) return null

  return numberValue(match[2])
}

/* =========================================================
   CHARGING
========================================================= */

function parseChargingPower(text) {
  const patterns = [
    /(?:Потужність\s+зарядки|Швидкість\s+зарядки|Зарядка)\s*:?\s*(\d+)\s*Вт/i,
    /(\d+)\s*Вт\s*(?:заряд|charging)/i
  ]

  for (const regex of patterns) {
    const match = text.match(regex)

    if (match) {
      return numberValue(match[1])
    }
  }

  return null
}

/* =========================================================
   BOOLEAN
========================================================= */

function parseBooleanFeature(text, feature) {
  const regex = new RegExp(
    `${feature}\\s*:?\\s*([+−-])?`,
    'i'
  )

  const match = text.match(regex)

  if (!match) return null

  if (match[1] === '-' || match[1] === '−') {
    return false
  }

  return true
}

function parseNfc(text) {
  return parseBooleanFeature(text, 'NFC')
}

function parse5G(text) {
  return /\b5G\b/i.test(text)
}

function parseMicroSD(text) {
  if (!/microSD/i.test(text)) {
    return null
  }

  return !/без\s+microSD|microSD\s*[-−]\s*немає/i.test(text)
}

/* =========================================================
   SIM
========================================================= */

function parseSimCount(text) {
  const patterns = [
    /(\d+)\s*SIM/i,
    /(\d+)\s*sim[-\s]?кар/i,
    /Dual\s*SIM/i
  ]

  for (const regex of patterns) {
    const match = text.match(regex)

    if (!match) continue

    if (/Dual/i.test(match[0])) {
      return 2
    }

    return numberValue(match[1])
  }

  return null
}

/* =========================================================
   COLOR
========================================================= */

function parseColor(text, name) {
  const colorPatterns = [
    /(?:Колір|Цвет)\s*:?\s*([А-Яа-яІіЇїЄєA-Za-z -]+)\s*$/i
  ]

  for (const regex of colorPatterns) {
    const match = text.match(regex)

    if (match) {
      return normalizeText(match[1])
    }
  }

  const colors = [
    ['light blue', 'блакитний'],
    ['midnight black', 'чорний'],
    ['black', 'чорний'],
    ['blue', 'синій'],
    ['green', 'зелений'],
    ['oak green', 'зелений'],
    ['purple', 'фіолетовий'],
    ['tapestry', 'синій'],
    ['arabesque', 'коричневий'],
    ['white', 'білий'],
    ['gray', 'сірий'],
    ['grey', 'сірий'],
    ['silver', 'сріблястий'],
    ['pink', 'рожевий'],
    ['violet', 'фіолетовий'],
    ['light violet', 'фіолетовий']
  ]

  const lowerName = name.toLowerCase()

  for (const [source, result] of colors) {
    if (lowerName.includes(source)) {
      return result
    }
  }

  return null
}

/* =========================================================
   CONFLICT CHECK
========================================================= */

function getMemoryFromName(name) {
  const match = name.match(
    /\b(\d+)\s*\/\s*(\d+)\s*(?:GB|Gb|ГБ)?\b/i
  )

  if (!match) return null

  return {
    ram: numberValue(match[1]),
    storage: numberValue(match[2])
  }
}

/* =========================================================
   MAIN PARSER
========================================================= */

function parseProduct(product) {
  const text = normalizeText(
    `${product.name} ${product.description || ''}`
  )

  const name = product.name

  const specs = {}

  upsertSpec(
    specs,
    'display_size',
    parseDisplaySize(text)
  )

  upsertSpec(
    specs,
    'display_type',
    parseDisplayType(text)
  )

  upsertSpec(
    specs,
    'resolution',
    parseResolution(text)
  )

  upsertSpec(
    specs,
    'refresh_rate',
    parseRefreshRate(text)
  )

  upsertSpec(
    specs,
    'ram',
    parseRam(product.description || '', name)
  )

  upsertSpec(
    specs,
    'storage',
    parseStorage(product.description || '', name)
  )

  upsertSpec(
    specs,
    'processor',
    parseProcessor(product.description || '')
  )

  upsertSpec(
    specs,
    'os',
    parseOS(product.description || '')
  )

  upsertSpec(
    specs,
    'battery',
    parseBattery(product.description || '')
  )

  upsertSpec(
    specs,
    'main_camera',
    parseMainCamera(product.description || '')
  )

  upsertSpec(
    specs,
    'front_camera',
    parseFrontCamera(product.description || '')
  )

  upsertSpec(
    specs,
    'charging_power',
    parseChargingPower(product.description || '')
  )

  const nfc = parseNfc(product.description || '')

  if (nfc !== null) {
    specs.nfc = nfc
  }

  if (parse5G(text)) {
    specs['5g'] = true
  }

  const microSD = parseMicroSD(product.description || '')

  if (microSD !== null) {
    specs.microsd = microSD
  }

  upsertSpec(
    specs,
    'sim_count',
    parseSimCount(product.description || '')
  )

  upsertSpec(
    specs,
    'color',
    parseColor(product.description || '', name)
  )

  return specs
}

/* =========================================================
   DATABASE
========================================================= */

async function main() {
  const products = await prisma.product.findMany({
    where: {
      category: 'Смартфони'
    },
    orderBy: {
      id: 'asc'
    }
  })

  const specifications = await prisma.specification.findMany({
    where: {
      active: true
    }
  })

  const specificationMap = new Map(
    specifications.map(spec => [spec.key, spec])
  )

  console.log(`Знайдено товарів: ${products.length}`)
  console.log(`Характеристик: ${specifications.length}`)
  console.log('')

  let totalWritten = 0

for (const product of products) {

  // Видаляємо старі характеристики товару,
  // щоб не залишалися значення від попередньої версії parser
  await prisma.productSpecification.deleteMany({
    where: {
      productId: product.id
    }
  })

  const parsed = parseProduct(product)
  if (product.id === 4) {
  console.log('')
  console.log('========== DEBUG A37 ==========')
  console.log('NAME:', product.name)
  console.log('DESCRIPTION:', product.description)
  console.log('PARSED:', parsed)
  console.log('================================')
  console.log('')
}
  let written = 0

    for (const [key, value] of Object.entries(parsed)) {
      const specification = specificationMap.get(key)

      if (!specification) {
        console.log(`⚠ Не знайдена характеристика: ${key}`)
        continue
      }

      let data = {
        productId: product.id,
        specificationId: specification.id,
        optionId: null,
        valueText: null,
        valueNumber: null,
        valueBoolean: null
      }

      /* ---------------------------------------------
         SELECT / MULTISELECT
      --------------------------------------------- */

      if (
        specification.type === 'SELECT' ||
        specification.type === 'MULTISELECT'
      ) {
        const stringValue = String(value)

        const option = await prisma.specificationOption.findFirst({
          where: {
            specificationId: specification.id,
            OR: [
              { value: stringValue },
              { label: stringValue }
            ]
          }
        })

        if (option) {
          data.optionId = option.id
        } else {
          data.valueText = stringValue
        }
      }

      /* ---------------------------------------------
         NUMBER
      --------------------------------------------- */

      else if (specification.type === 'NUMBER') {
        data.valueNumber = numberValue(value)
      }

      /* ---------------------------------------------
         BOOLEAN
      --------------------------------------------- */

      else if (specification.type === 'BOOLEAN') {
        data.valueBoolean =
          value === true ||
          value === '+' ||
          value === 'true'
      }

      /* ---------------------------------------------
         TEXT
      --------------------------------------------- */

      else {
        data.valueText = String(value)
      }

  await prisma.productSpecification.create({
  data
})

      written++
      totalWritten++
    }

    /* ---------------------------------------------
       CONFLICT CHECK
    --------------------------------------------- */

    const nameMemory = getMemoryFromName(product.name)

    const descriptionRam = parseRam(
      product.description || '',
      ''
    )

    const descriptionStorage = parseStorage(
      product.description || '',
      ''
    )

    const conflicts = []

    if (
      nameMemory &&
      descriptionRam !== null &&
      nameMemory.ram !== descriptionRam
    ) {
      conflicts.push(
        `ОЗП: назва ${nameMemory.ram} ГБ ≠ опис ${descriptionRam} ГБ`
      )
    }

    if (
      nameMemory &&
      descriptionStorage !== null &&
      nameMemory.storage !== descriptionStorage
    ) {
      conflicts.push(
        `Памʼять: назва ${nameMemory.storage} ГБ ≠ опис ${descriptionStorage} ГБ`
      )
    }

    console.log(
      `✓ ${product.name} → ${written} характеристик`
    )

    if (conflicts.length) {
      for (const conflict of conflicts) {
        console.log(`  ⚠ ${conflict}`)
      }
    }
  }

  console.log('')
  console.log('================================')
  console.log('Готово!')
  console.log(`Оброблено товарів: ${products.length}`)
  console.log(`Записано характеристик: ${totalWritten}`)
  console.log('================================')
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