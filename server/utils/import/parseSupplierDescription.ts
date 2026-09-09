type SpecificationOptionInput = {
  id: number
  label: string
  value: string
}

type SpecificationInput = {
  id: number
  name: string
  key: string
  type: string
  unit: string | null
  required?: boolean
  filterable?: boolean
  options?: SpecificationOptionInput[]
}

export interface ParsedSupplierSpecification {
  specificationId: number
  key: string
  name: string
  type: string
  unit: string | null

  optionId: number | null
  optionLabel: string | null

  valueText: string | null
  valueNumber: number | null
  valueBoolean: boolean | null

  displayValue: string

  source: 'supplier_description'
  confidence: number
}

/* ==================================================
   NORMALIZE
================================================== */

function normalizeText(
  value: unknown
) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\u00a0/g, ' ')
    .replace(/[“”«»]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeOptionText(
  value: unknown
) {
  return normalizeText(value)
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[,_;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function numberValue(
  value: string | number
) {
  const number =
    typeof value === 'number'
      ? value
      : Number(
          String(value)
            .replace(',', '.')
        )

  return Number.isFinite(number)
    ? number
    : null
}

/* ==================================================
   MEMORY
================================================== */

function parseRam(
  text: string,
  productName: string
) {
  /*
    ОЗП 6 ГБ
    RAM 8 GB
    оперативна пам'ять 12 ГБ
  */

  const labeled =
    text.match(
      /(?:озп|ram|оперативн(?:а|ої)\s+пам['’]?ят[ьі])\s*:?\s*(\d{1,2})\s*(?:гб|gb)\b/i
    )

  if (labeled) {
    return numberValue(
      labeled[1]
    )
  }

  /*
    8/256GB
    8 / 256 GB
    8+256GB
  */

  const pair =
    productName.match(
      /\b(2|3|4|6|8|12|16|24)\s*[\/+]\s*(32|64|128|256|512|1024)\s*(?:gb|гб)?\b/i
    )

  if (pair) {
    return numberValue(
      pair[1]
    )
  }

  return null
}

function parseStorage(
  text: string,
  productName: string
) {
  /*
    128 ГБ вбудованої
    256 GB storage
    пам'ять 512 ГБ
  */

  const labeledPatterns = [
    /(\d{2,4})\s*(?:гб|gb)\s+(?:вбудованої|встроенной|storage|rom)\b/i,

    /(?:вбудован(?:а|ої)\s+пам['’]?ят[ьі]|rom|storage)\s*:?\s*(\d{2,4})\s*(?:гб|gb)\b/i,

    /(?:пам['’]?ять|память)\s*:?\s*(\d{2,4})\s*(?:гб|gb)\b/i
  ]

  for (
    const pattern
    of labeledPatterns
  ) {
    const match =
      text.match(pattern)

    if (match) {
      return numberValue(
        match[1]
      )
    }
  }

  const pair =
    productName.match(
      /\b(?:2|3|4|6|8|12|16|24)\s*[\/+]\s*(32|64|128|256|512|1024)\s*(?:gb|гб)?\b/i
    )

  if (pair) {
    return numberValue(
      pair[1]
    )
  }

  return null
}

/* ==================================================
   DISPLAY
================================================== */

function parseDisplaySize(
  text: string
) {
  /*
    6.7"
    6,7"
    6.7 дюйма
  */

  const match =
    text.match(
      /\b(\d(?:[.,]\d{1,2}))\s*(?:"|″|дюйм(?:а|ів|ов)?)/i
    )

  if (!match) {
    return null
  }

  return numberValue(
    match[1]
  )
}

function parseResolution(
  text: string
) {
  /*
    2340x1080
    2340 × 1080
  */

  const match =
    text.match(
      /\b(\d{3,4})\s*[xх×]\s*(\d{3,4})\b/i
    )

  if (!match) {
    return null
  }

  return `${match[1]}x${match[2]}`
}

function parseRefreshRate(
  text: string
) {
 

  const labeled =
    text.match(
      /(?:частота\s+(?:оновлення|обновления)|refresh\s*rate)\s*:?\s*(\d{2,3})\s*(?:гц|hz)?/i
    )

  

  const generic =
    text.match(
      /(\d{2,3})\s*(?:гц|hz)/i
    )

 

  if (labeled?.[1]) {
    return numberValue(
      labeled[1]
    )
  }

  if (generic?.[1]) {
    return numberValue(
      generic[1]
    )
  }

  return null
}
/* ==================================================
   BATTERY / CHARGING
================================================== */

function parseBattery(
  text: string
) {
  /*
    Підтримує:

    5200 mAh
    5200 mah
    5200 мАг
    5200 мАч
    5200 мА·год
    5200 мАгод
    5200 мА год
    Акумулятор: 5200
    Батарея: 5000
  */

  const labeled =
    text.match(
      /(?:акумулятор|батарея)\s*:?\s*(\d{3,5})/i
    )

  if (labeled?.[1]) {
    return numberValue(
      labeled[1]
    )
  }

  const generic =
    text.match(
      /\b(\d{3,5})\s*(?:mah|mаh|мач|маг|м[аa]\s*[·.\-]?\s*год|м[аa]\s*год)\b/i
    )

  if (generic?.[1]) {
    return numberValue(
      generic[1]
    )
  }

  return null
}

function parseChargingPower(
  text: string
) {
  const match =
    text.match(
      /\b(\d{1,3}(?:[.,]\d+)?)\s*(?:w|вт)\b/i
    )

  if (!match) {
    return null
  }

  return numberValue(
    match[1]
  )
}

/* ==================================================
   CAMERA
================================================== */

function cleanCameraValue(
  value: string
) {
  return value
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .trim()
}

function parseCameras(
  text: string
) {
  let main: string | null = null
  let front: string | null = null

  /*
    Варіант:
    Камера: 50+8+5 Мп + 12 Мп

    Перша група — основна камера
    Друга — фронтальна
  */
  const combined =
    text.match(
      /(?:камера|camera)\s*:?\s*([\d.,]+(?:\s*\+\s*[\d.,]+)*)(?:\s*\([^)]*\))?\s*мп\s*\+\s*([\d.,]+)(?:\s*\([^)]*\))?\s*мп/i
    )

  if (combined) {
    main =
      cleanCameraValue(
        combined[1]
      )

    front =
      cleanCameraValue(
        combined[2]
      )

    return {
      main,
      front
    }
  }

  /*
    Основна камера:

    Камера: 50 Мп
    Камера: 50+8+2 Мп
    Камера: 50 (f/1.8, ширококутна) Мп
    Основна камера: 50+8+5 Мп
  */
  const mainMatch =
    text.match(
      /(?:основн\w*\s+камера|камера|main\s+camera)\s*:?\s*([\d.,]+(?:\s*\+\s*[\d.,]+)*)(?:\s*\([^)]*\))?\s*мп/i
    )

  if (mainMatch?.[1]) {
    main =
      cleanCameraValue(
        mainMatch[1]
      )
  }

  /*
    Фронтальна:

    Фронтальна камера: 13 Мп
    Фронтальна: 13 Мп
    Селфі камера: 13 Мп
    Селфі-камера: 13 Мп
    Front camera: 13 MP
  */
  const frontMatch =
    text.match(
      /(?:фронтальн\w*(?:\s+камера)?|селфі[\s-]*камера|selfie\s+camera|front\s+camera)\s*:?\s*([\d.,]+)(?:\s*\([^)]*\))?\s*(?:мп|mp)/i
    )

  if (frontMatch?.[1]) {
    front =
      cleanCameraValue(
        frontMatch[1]
      )
  }

  return {
    main,
    front
  }
}
/* ==================================================
   PROCESSOR
================================================== */

function parseProcessor(
  text: string
) {
  /*
    Підтримує:

    Процесор: Mediatek Helio G81 Ultra. ОС: Android 15
    Процесор: Mediatek Helio G81 Ultra / ОС: Android 15
    Процесор: Mediatek Helio G81 Ultra ОС: Android 15
    Процесор: Mediatek Helio G81 Ultra
    ОС: Android 15
  */

  const labeled =
    text.match(
      /(?:процесор|процессор|processor)\s*:?\s*(.+?)(?=\s*(?:[.;/|]\s*)?(?:ос|операційна\s+система|операционная\s+система|android|ios|акумулятор|батарея|камера|основна\s+камера|фронтальна\s+камера|nfc|пам['’]?ять|озп|ram|rom|екран|дисплей|корпус|sim|wi-?fi|bluetooth|gps)\s*:?\s*|$)/i
    )

  if (labeled?.[1]) {
    return labeled[1]
      .replace(/[.;/|]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /*
    Fallback, якщо слова "Процесор:"
    взагалі немає.
  */

  const families = [
    /(?:qualcomm\s+)?snapdragon\s+[\w+\-.]+(?:\s+[\w+\-.]+){0,4}/i,

    /(?:samsung\s+)?exynos\s+[\w+\-.]+(?:\s+[\w+\-.]+){0,2}/i,

    /(?:mediatek\s+)?dimensity\s+[\w+\-.]+(?:\s+[\w+\-.]+){0,3}/i,

    /(?:mediatek\s+)?helio\s+[\w+\-.]+(?:\s+[\w+\-.]+){0,3}/i,

    /(?:unisoc\s+)?(?:tiger\s+)?t\d{3,4}[\w+\-.]*/i
  ]

  for (const pattern of families) {
    const match =
      text.match(pattern)

    if (match?.[0]) {
      return match[0]
        .replace(/\s+/g, ' ')
        .trim()
    }
  }

  return null
}

/* ==================================================
   OPERATING SYSTEM
================================================== */

function parseOS(
  text: string
) {
  const android =
    text.match(
      /\bandroid\s*(\d+(?:[.,]\d+)?)/i
    )

  if (android) {
    return `Android ${android[1]
      .replace(',', '.')}`
  }

  const ios =
    text.match(
      /\bios\s*(\d+(?:[.,]\d+)?)/i
    )

  if (ios) {
    return `iOS ${ios[1]
      .replace(',', '.')}`
  }

  return null
}

/* ==================================================
   SIM
================================================== */

function parseSimCount(
  text: string
) {
  const explicit =
    text.match(
      /\b([1-4])\s*(?:sim|сім)\b/i
    )

  if (explicit) {
    return numberValue(
      explicit[1]
    )
  }

  if (
    /\bdual\s*sim\b/i.test(text)
  ) {
    return 2
  }

  return null
}

/* ==================================================
   SELECT OPTION MATCHING
================================================== */

function findOption(
  text: string,
  options:
    SpecificationOptionInput[]
) {
  if (!options.length) {
    return null
  }

  const normalizedText =
    normalizeOptionText(text)

  /*
    Довші значення перевіряємо першими,
    щоб "темно-сірий" не перетворився
    просто на "сірий".
  */

  const sorted =
    [...options]
      .sort(
        (a, b) =>
          Math.max(
            b.label.length,
            b.value.length
          ) -
          Math.max(
            a.label.length,
            a.value.length
          )
      )

  for (
    const option
    of sorted
  ) {
    const variants = [
      option.label,
      option.value
    ]
      .map(
        normalizeOptionText
      )
      .filter(Boolean)

    for (
      const variant
      of variants
    ) {
      if (
        variant.length >= 2 &&
        normalizedText.includes(
          variant
        )
      ) {
        return option
      }
    }
  }

  return null
}

/* ==================================================
   RESULT HELPERS
================================================== */

function createNumberResult(
  specification:
    SpecificationInput,
  value: number,
  confidence = 0.98
): ParsedSupplierSpecification {
  return {
    specificationId:
      specification.id,

    key:
      specification.key,

    name:
      specification.name,

    type:
      specification.type,

    unit:
      specification.unit,

    optionId:
      null,

    optionLabel:
      null,

    valueText:
      null,

    valueNumber:
      value,

    valueBoolean:
      null,

    displayValue:
      specification.unit
        ? `${value} ${specification.unit}`
        : String(value),

    source:
      'supplier_description',

    confidence
  }
}

function createTextResult(
  specification:
    SpecificationInput,
  value: string,
  confidence = 0.95
): ParsedSupplierSpecification {
  return {
    specificationId:
      specification.id,

    key:
      specification.key,

    name:
      specification.name,

    type:
      specification.type,

    unit:
      specification.unit,

    optionId:
      null,

    optionLabel:
      null,

    valueText:
      value,

    valueNumber:
      null,

    valueBoolean:
      null,

    displayValue:
      specification.unit
        ? `${value} ${specification.unit}`
        : value,

    source:
      'supplier_description',

    confidence
  }
}

function createBooleanResult(
  specification:
    SpecificationInput,
  value: boolean,
  confidence = 0.98
): ParsedSupplierSpecification {
  return {
    specificationId:
      specification.id,

    key:
      specification.key,

    name:
      specification.name,

    type:
      specification.type,

    unit:
      specification.unit,

    optionId:
      null,

    optionLabel:
      null,

    valueText:
      null,

    valueNumber:
      null,

    valueBoolean:
      value,

    displayValue:
      value
        ? 'Так'
        : 'Ні',

    source:
      'supplier_description',

    confidence
  }
}

function createOptionResult(
  specification:
    SpecificationInput,
  option:
    SpecificationOptionInput,
  confidence = 0.96
): ParsedSupplierSpecification {
  return {
    specificationId:
      specification.id,

    key:
      specification.key,

    name:
      specification.name,

    type:
      specification.type,

    unit:
      specification.unit,

    optionId:
      option.id,

    optionLabel:
      option.label,

    valueText:
      null,

    valueNumber:
      null,

    valueBoolean:
      null,

    displayValue:
      option.label,

    source:
      'supplier_description',

    confidence
  }
}

/* ==================================================
   MAIN PARSER
================================================== */

export function parseSupplierDescription(
  input: {
    text: string
    productName?: string | null
    specifications:
      SpecificationInput[]
  }
) {
  const text =
    String(
      input.text ?? ''
    ).trim()

  const productName =
    String(
      input.productName ?? ''
    ).trim()

  const combinedText =
    `${productName} ${text}`
      .trim()

  const normalized =
    normalizeText(
      combinedText
    )

  const result:
    ParsedSupplierSpecification[] =
      []

  const ram =
    parseRam(
      text,
      productName
    )

  const storage =
    parseStorage(
      text,
      productName
    )

  const displaySize =
    parseDisplaySize(
      combinedText
    )

  const resolution =
    parseResolution(
      combinedText
    )

  const refreshRate =
    parseRefreshRate(
      combinedText
    )

  const battery =
    parseBattery(
      combinedText
    )

  const chargingPower =
    parseChargingPower(
      combinedText
    )

  const cameras =
    parseCameras(
      combinedText
    )

  const processor =
    parseProcessor(
      combinedText
    )

  const os =
    parseOS(
      combinedText
    )

  const simCount =
    parseSimCount(
      combinedText
    )

  for (
    const specification
    of input.specifications
  ) {
    const key =
      specification.key
        .toLowerCase()
        .trim()

    /* RAM */

    if (
      key === 'ram' &&
      ram !== null
    ) {
      result.push(
        createNumberResult(
          specification,
          ram
        )
      )

      continue
    }

    /* STORAGE */

    if (
      key === 'storage' &&
      storage !== null
    ) {
      result.push(
        createNumberResult(
          specification,
          storage
        )
      )

      continue
    }

    /* DISPLAY SIZE */

    if (
      key === 'display_size' &&
      displaySize !== null
    ) {
      result.push(
        createNumberResult(
          specification,
          displaySize
        )
      )

      continue
    }

    /* RESOLUTION */

    if (
      key === 'resolution' &&
      resolution
    ) {
      result.push(
        createTextResult(
          specification,
          resolution
        )
      )

      continue
    }

    /* REFRESH RATE */

    if (
      key === 'refresh_rate' &&
      refreshRate !== null
    ) {
      result.push(
        createNumberResult(
          specification,
          refreshRate
        )
      )

      continue
    }

    /* PROCESSOR */

    if (
      key === 'processor' &&
      processor
    ) {
      result.push(
        createTextResult(
          specification,
          processor,
          0.93
        )
      )

      continue
    }

    /* OS */

    if (
      key === 'os' &&
      os
    ) {
      result.push(
        createTextResult(
          specification,
          os
        )
      )

      continue
    }

    /* BATTERY */

    if (
      key === 'battery' &&
      battery !== null
    ) {
      result.push(
        createNumberResult(
          specification,
          battery
        )
      )

      continue
    }

    /* MAIN CAMERA */

    if (
      key === 'main_camera' &&
      cameras.main
    ) {
      result.push(
        createTextResult(
          specification,
          cameras.main
        )
      )

      continue
    }

    /* FRONT CAMERA */

    if (
      key === 'front_camera' &&
      cameras.front
    ) {
      result.push(
        createTextResult(
          specification,
          cameras.front
        )
      )

      continue
    }

    /* CHARGING */

    if (
      key === 'charging_power' &&
      chargingPower !== null
    ) {
      result.push(
        createNumberResult(
          specification,
          chargingPower
        )
      )

      continue
    }

    /* NFC */

    if (
      key === 'nfc' &&
      /\bnfc\b/i.test(
        normalized
      )
    ) {
      result.push(
        createBooleanResult(
          specification,
          true
        )
      )

      continue
    }

    /* 5G */

    if (
      key === '5g' &&
      /\b5g\b/i.test(
        normalized
      )
    ) {
      result.push(
        createBooleanResult(
          specification,
          true
        )
      )

      continue
    }

    /* SIM COUNT */

    if (
      key === 'sim_count' &&
      simCount !== null
    ) {
      result.push(
        createNumberResult(
          specification,
          simCount,
          0.9
        )
      )

      continue
    }

    /* MICROSD */

    if (
      key === 'microsd' &&
      /\b(?:microsd|micro\s*sd)\b/i
        .test(normalized)
    ) {
      result.push(
        createBooleanResult(
          specification,
          true
        )
      )

      continue
    }

    /* ==================================================
       SELECT OPTIONS

       Працює для:
       - color
       - display_type
       - та майбутніх SELECT характеристик
    ================================================== */

    if (
      specification.type ===
        'SELECT' &&
      specification.options?.length
    ) {
      const option =
        findOption(
          combinedText,
          specification.options
        )

      if (option) {
        result.push(
          createOptionResult(
            specification,
            option
          )
        )

        continue
      }
    }
  }

  return result
}