import { generateText } from 'ai'
import requireAdmin from '../../../utils/requireAdmin'
import { openai } from '../../../services/mobi/providers/openai'

type BonusCategory =
  | 'SMARTPHONE'
  | 'FEATURE_PHONE'
  | 'ACCESSORY'
  | 'SERVICE'
  | 'NO_REWARD'

interface RecognizedReceiptItem {
  name: string
  quantity: number
  unitPrice: number
  bonusCategory: BonusCategory
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const formData = await readMultipartFormData(event)

  const imagePart = formData?.find(
    part => part.name === 'image'
  )

  if (
    !imagePart ||
    !imagePart.data ||
    !imagePart.type?.startsWith('image/')
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Фото чека не знайдено'
    })
  }

  /*
   * Обмежуємо розмір фото.
   * Фото ніде не зберігається —
   * воно існує тільки під час цього запиту.
   */
  const maxFileSize = 8 * 1024 * 1024

  if (imagePart.data.length > maxFileSize) {
    throw createError({
      statusCode: 413,
      statusMessage:
        'Фото занадто велике. Максимальний розмір — 8 МБ.'
    })
  }

  try {
    const base64 =
      imagePart.data.toString('base64')

    const imageUrl =
      `data:${imagePart.type};base64,${base64}`

    const result = await generateText({
   model: openai('gpt-5.6-luna'),

      messages: [
        {
          role: 'user',

          content: [
            {
              type: 'text',

              text: `
Ти розпізнаєш позиції українського фіскального чека магазину електроніки.

На фотографії знайди ТІЛЬКИ товари та послуги, які входять у фіскальний чек.

Для кожної позиції визнач:

- name — повна назва позиції
- quantity — кількість
- unitPrice — ціна за одну одиницю у гривнях
- bonusCategory — одна з категорій:
  SMARTPHONE
  FEATURE_PHONE
  ACCESSORY
  SERVICE
  NO_REWARD

Правила категорій:

SMARTPHONE:
смартфони.

FEATURE_PHONE:
кнопкові телефони.

ACCESSORY:
чохли, плівки, захисне скло, зарядні пристрої,
кабелі, навушники, power bank та інші аксесуари.

SERVICE:
ремонт, налаштування, наклеювання скла або плівки,
перенесення даних та інші послуги.

NO_REWARD:
позиція, яку неможливо впевнено віднести
до попередніх категорій.

ВАЖЛИВО:

1. Не вигадуй позиції.
2. Не включай рядки "СУМА", "ГОТІВКА", "ПДВ",
   податки, номер чека, дату, QR-код та службову інформацію.
3. Якщо назва займає декілька рядків,
   об'єднай їх в одну назву.
4. Числа з комою трактуй як десяткові.
5. Поверни ТІЛЬКИ JSON.
6. Не використовуй Markdown і \`\`\`.

Формат:

{
  "items": [
    {
      "name": "Назва товару",
      "quantity": 1,
      "unitPrice": 499,
      "bonusCategory": "ACCESSORY"
    }
  ]
}
`
            },

            {
              type: 'image',
              image: imageUrl
            }
          ]
        }
      ]
    })

    let parsed: {
      items?: RecognizedReceiptItem[]
    }

    try {
      parsed = JSON.parse(
        result.text
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/, '')
          .replace(/\s*```$/, '')
          .trim()
      )
    } catch {
      console.error(
        'RECEIPT AI RESPONSE:',
        result.text
      )

      throw createError({
        statusCode: 502,
        statusMessage:
          'AI не зміг повернути правильний формат позицій'
      })
    }

    if (!Array.isArray(parsed.items)) {
      throw createError({
        statusCode: 502,
        statusMessage:
          'AI не знайшов таблицю позицій чека'
      })
    }

    const allowedCategories:
      BonusCategory[] = [
        'SMARTPHONE',
        'FEATURE_PHONE',
        'ACCESSORY',
        'SERVICE',
        'NO_REWARD'
      ]

    const items =
      parsed.items
        .map(item => ({
          name:
            String(item.name || '').trim(),

          quantity:
            Number(item.quantity),

          unitPrice:
            Number(item.unitPrice),

          bonusCategory:
            allowedCategories.includes(
              item.bonusCategory
            )
              ? item.bonusCategory
              : 'NO_REWARD' as BonusCategory
        }))
        .filter(item =>
          item.name &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0 &&
          Number.isFinite(item.unitPrice) &&
          item.unitPrice >= 0
        )

    if (!items.length) {
      throw createError({
        statusCode: 422,
        statusMessage:
          'На фотографії не вдалося знайти позиції чека'
      })
    }

    const recognizedTotal =
      Math.round(
        items.reduce(
          (sum, item) =>
            sum +
            item.quantity *
            item.unitPrice,
          0
        ) * 100
      ) / 100

    return {
      success: true,
      items,
      recognizedTotal
    }
  } catch (error: any) {
    /*
     * Наші createError пропускаємо далі.
     */
    if (error?.statusCode) {
      throw error
    }

    console.error(
      'RECEIPT RECOGNITION ERROR:',
      error
    )

    throw createError({
      statusCode: 500,
      statusMessage:
        'Не вдалося розпізнати фотографію чека'
    })
  }
})