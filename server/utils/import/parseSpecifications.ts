import {
  normalizeProductText
} from './normalizeProductText'

interface SpecificationOptionLike {
  id: number
  label: string
  value: string
}

interface SpecificationLike {
  id: number
  name: string
  key: string

  type:
    | 'TEXT'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'SELECT'
    | 'MULTISELECT'

  unit: string | null

  options: SpecificationOptionLike[]
}

interface CategorySpecificationLike {
  required: boolean
  filterable: boolean
  sortOrder: number

  specification: SpecificationLike
}

export interface ParsedSpecification {
  specificationId: number
  key: string
  name: string

  optionId: number | null

  valueText: string | null
  valueNumber: number | null
  valueBoolean: boolean | null

  displayValue: string | null

  confidence: number
}

/* ==================================================
   RAM + STORAGE
================================================== */

function parseRamStorage(
  value: string
) {
  const match =
    value.match(
      /(?:^|\s)(\d{1,2})\s*(?:gb|гб)?\s*[\/+]\s*(\d{2,4})\s*(?:gb|гб)?(?:\s|$)/i
    )

  if (!match?.[1] || !match?.[2]) {
    return null
  }

  const ram =
    Number(match[1])

  const storage =
    Number(match[2])

  const allowedRam =
    [
      2,
      3,
      4,
      6,
      8,
      12,
      16,
      24
    ]

  const allowedStorage =
    [
      16,
      32,
      64,
      128,
      256,
      512,
      1024
    ]

  if (
    !allowedRam.includes(ram) ||
    !allowedStorage.includes(storage)
  ) {
    return null
  }

  return {
    ram,
    storage
  }
}

/* ==================================================
   NUMBER BEFORE UNIT
================================================== */

function escapeRegExp(
  value: string
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )
}

function findNumberBeforeUnit(
  value: string,
  units: string[]
) {
  for (const unit of units) {
    const escapedUnit =
      escapeRegExp(unit)

    const regex =
      new RegExp(
        `(\\d+(?:[.,]\\d+)?)\\s*${escapedUnit}\\b`,
        'i'
      )

    const match =
      value.match(regex)

    if (!match?.[1]) {
      continue
    }

    const parsed =
      Number(
        match[1].replace(
          ',',
          '.'
        )
      )

    if (
      Number.isFinite(parsed)
    ) {
      return parsed
    }
  }

  return null
}

/* ==================================================
   SELECT
================================================== */

function containsNormalizedPhrase(
  text: string,
  phrase: string
) {
  if (!phrase) {
    return false
  }

  /*
    Пробіли по краях захищають, наприклад,
    "red" від випадкового збігу всередині слова.
  */

  const source =
    ` ${text} `

  const target =
    ` ${phrase} `

  return source.includes(target)
}

function matchSelectOption(
  productName: string,
  specification: SpecificationLike
) {
  const normalizedProduct =
    normalizeProductText(
      productName
    )

  const candidates =
    specification.options
      .map(option => {
        const normalizedLabel =
          normalizeProductText(
            option.label
          )

        const normalizedValue =
          normalizeProductText(
            option.value
          )

        let score = 0

        if (
          normalizedLabel &&
          containsNormalizedPhrase(
            normalizedProduct,
            normalizedLabel
          )
        ) {
          /*
            Довший варіант важливіший.

            Наприклад:
            Glacier Blue
            має перемогти
            Blue.
          */

          score =
            Math.max(
              score,
              normalizedLabel.length
            )
        }

        if (
          normalizedValue &&
          containsNormalizedPhrase(
            normalizedProduct,
            normalizedValue
          )
        ) {
          score =
            Math.max(
              score,
              normalizedValue.length
            )
        }

        return {
          option,
          score
        }
      })
      .filter(
        item =>
          item.score > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )

  return (
    candidates[0]?.option ??
    null
  )
}

/* ==================================================
   DISPLAY VALUE
================================================== */

function displayNumber(
  value: number,
  unit: string | null
) {
  if (!unit) {
    return String(value)
  }

  return `${value} ${unit}`
}

/* ==================================================
   MAIN
================================================== */

export function parseSpecifications(
  productName: string,
  categorySpecifications:
    CategorySpecificationLike[]
): ParsedSpecification[] {
  const normalized =
    normalizeProductText(
      productName
    )

  const result:
    ParsedSpecification[] = []

  const memory =
    parseRamStorage(
      normalized
    )

  for (
    const relation
    of categorySpecifications
  ) {
    const spec =
      relation.specification

    const key =
      spec.key
        .toLowerCase()
        .trim()

    /* ==================================================
       RAM
    ================================================== */

    if (
      key === 'ram' &&
      memory
    ) {
      result.push({
        specificationId:
          spec.id,

        key:
          spec.key,

        name:
          spec.name,

        optionId:
          null,

        valueText:
          null,

        valueNumber:
          memory.ram,

        valueBoolean:
          null,

        displayValue:
          displayNumber(
            memory.ram,
            spec.unit
          ),

        confidence:
          0.99
      })

      continue
    }

    /* ==================================================
       STORAGE
    ================================================== */

    if (
      [
        'storage',
        'rom',
        'internal_storage'
      ].includes(key) &&
      memory
    ) {
      result.push({
        specificationId:
          spec.id,

        key:
          spec.key,

        name:
          spec.name,

        optionId:
          null,

        valueText:
          null,

        valueNumber:
          memory.storage,

        valueBoolean:
          null,

        displayValue:
          displayNumber(
            memory.storage,
            spec.unit
          ),

        confidence:
          0.99
      })

      continue
    }

    /* ==================================================
       CHARGING POWER

       20W
       45 W
       67Вт
    ================================================== */

    if (
      [
        'charging_power',
        'charge_power'
      ].includes(key)
    ) {
      const value =
        findNumberBeforeUnit(
          normalized,
          [
            'w',
            'вт'
          ]
        )

      if (value !== null) {
        result.push({
          specificationId:
            spec.id,

          key:
            spec.key,

          name:
            spec.name,

          optionId:
            null,

          valueText:
            null,

          valueNumber:
            value,

          valueBoolean:
            null,

          displayValue:
            displayNumber(
              value,
              spec.unit
            ),

          confidence:
            0.95
        })

        continue
      }
    }

    /* ==================================================
       BATTERY

       5000mAh
       5000 mAh
       6000 мАч
    ================================================== */

    if (
      [
        'battery',
        'battery_capacity'
      ].includes(key)
    ) {
      const value =
        findNumberBeforeUnit(
          normalized,
          [
            'mah',
            'мач'
          ]
        )

      if (value !== null) {
        result.push({
          specificationId:
            spec.id,

          key:
            spec.key,

          name:
            spec.name,

          optionId:
            null,

          valueText:
            null,

          valueNumber:
            value,

          valueBoolean:
            null,

          displayValue:
            displayNumber(
              value,
              spec.unit
            ),

          confidence:
            0.95
        })

        continue
      }
    }

    /* ==================================================
       SELECT

       Наприклад:
       Black
       White
       Glacier Blue
       Tapestry
    ================================================== */

    if (
      spec.type === 'SELECT'
    ) {
      const option =
        matchSelectOption(
          productName,
          spec
        )

      if (option) {
        result.push({
          specificationId:
            spec.id,

          key:
            spec.key,

          name:
            spec.name,

          optionId:
            option.id,

          valueText:
            null,

          valueNumber:
            null,

          valueBoolean:
            null,

          displayValue:
            option.label,

          confidence:
            0.95
        })

        continue
      }
    }
  }

  return result
}