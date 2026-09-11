import { generateText } from 'ai'
import { openai } from './providers/openai'
import { mobiConfig } from './config'

export interface ServiceSeoInput {
  name: string
  description?: string
  category?: string
  price?: number
  priceFrom?: boolean
  duration?: string
}

export interface ServiceSeoResult {
  seoText: string
  whatIncluded: string
  metaTitle: string
  metaDescription: string
}

export async function generateServiceSeo(
  input: ServiceSeoInput
): Promise<ServiceSeoResult> {
  const result = await generateText({
    model: openai(mobiConfig.model),

    system: `
Ти — Мобі, AI-помічник магазину та сервісного центру Mobilon
у Солотвині, Закарпатська область, Україна.

Твоє завдання — допомагати адміністратору Mobilon створювати
якісний контент для сторінок послуг.

ПРАВИЛА:

1. Пиши українською мовою.
2. Не вигадуй факти, яких немає у вхідних даних.
3. Не вигадуй ціни, гарантії, строки ремонту або наявність деталей.
4. Природно використовуй назву послуги та географію "Солотвино".
5. Використовуй доречні синоніми пошукових запитів.
6. Не перенасичуй текст ключовими словами.
7. Текст має бути написаний насамперед для людини.
8. metaTitle має чітко описувати конкретну послугу.
9. Намагайся робити metaTitle приблизно до 60 символів.
10. metaDescription має бути природним коротким описом сторінки,
    орієнтовно 120–160 символів.
11. seoText — 2–3 невеликі абзаци з корисним описом послуги.
12. whatIncluded формуй тільки на основі наданої інформації.
13. Якщо неможливо достовірно визначити, що входить у послугу,
    не вигадуй конкретних робіт.
14. Не використовуй перебільшення на кшталт
    "найкращий", "№1", "найдешевший", якщо цього не підтверджено.

Поверни ТІЛЬКИ коректний JSON.
Не використовуй Markdown і блоки коду.

Формат відповіді:

{
  "seoText": "...",
  "whatIncluded": "...",
  "metaTitle": "...",
  "metaDescription": "..."
}
`,

    prompt: `
Створи SEO-контент для цієї послуги Mobilon.

Назва:
${input.name}

Короткий опис:
${input.description || 'Не вказано'}

Категорія:
${input.category || 'Не вказано'}

Ціна:
${
  typeof input.price === 'number'
    ? `${input.priceFrom ? 'від ' : ''}${input.price} грн`
    : 'Не вказано'
}

Тривалість:
${input.duration || 'Не вказано'}
`
  })

  let parsed: unknown

  try {
    parsed = JSON.parse(result.text.trim())
  } catch (error) {
    console.error(
      'Mobi SEO JSON parse error:',
      result.text,
      error
    )

    throw createError({
      statusCode: 500,
      statusMessage:
        'Мобі повернув некоректну відповідь'
    })
  }

  if (
    !parsed ||
    typeof parsed !== 'object'
  ) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Мобі повернув некоректні SEO-дані'
    })
  }

  const data = parsed as Record<string, unknown>

  return {
    seoText:
      typeof data.seoText === 'string'
        ? data.seoText.trim()
        : '',

    whatIncluded:
      typeof data.whatIncluded === 'string'
        ? data.whatIncluded.trim()
        : '',

    metaTitle:
      typeof data.metaTitle === 'string'
        ? data.metaTitle.trim()
        : '',

    metaDescription:
      typeof data.metaDescription === 'string'
        ? data.metaDescription.trim()
        : ''
  }
}