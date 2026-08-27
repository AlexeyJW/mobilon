import { generateText, stepCountIs } from 'ai'
import { openai } from './providers/openai'
import { systemPrompt } from './prompts'
import { mobiConfig } from './config'

import type { ChatResponse } from '../../../types/chat-response'
import type { LeadDraft } from '../../../types/lead'
import type { ConversationMode } from '../../../types/conversation'
import type { MobiMessage } from '../../../types/mobi'

import { openAITools } from './tools/openai-tools'
import { toModelMessages } from './mappers/messages'

interface AgentProduct {
  id: number
  name?: string
}

function collectProducts(result: any): AgentProduct[] {
  const products: AgentProduct[] = []

  for (const step of result.steps || []) {
    for (const toolResult of step.toolResults || []) {
      const output = toolResult?.output

      if (!output) continue

      /*
       * Підтримуємо кілька можливих форматів
       * відповіді findProducts:
       *
       * [
       *   { id: 1, name: '...' }
       * ]
       *
       * або:
       *
       * { products: [...] }
       */

      const candidates = Array.isArray(output)
        ? output
        : Array.isArray(output.products)
          ? output.products
          : []

      for (const product of candidates) {
        if (
          product &&
          typeof product.id === 'number'
        ) {
          products.push({
            id: product.id,
            name: product.name
          })
        }
      }
    }
  }

  // прибираємо дублікати
  return Array.from(
    new Map(
      products.map(product => [
        product.id,
        product
      ])
    ).values()
  )
}

export class MobiAgent {
 async chat(
  messages: MobiMessage[],
  lead: LeadDraft,
  mode: ConversationMode,
  excludeProductIds: number[] = [],
  shownProducts: AgentProduct[] = []
): Promise<ChatResponse> {

    const uniqueExcludedIds = Array.from(
      new Set(
        excludeProductIds
          .filter(id => Number.isInteger(id))
      )
    )

   const exclusionInstruction =
  uniqueExcludedIds.length > 0
    ? `

ВАЖЛИВИЙ КОНТЕКСТ ПОШУКУ ТОВАРІВ:

У цій розмові клієнту вже були показані або відхилені
товари з ID:

${uniqueExcludedIds.join(', ')}

ПРАВИЛА:

1. Якщо клієнт просить ПОКАЗАТИ ЩЕ ТОВАРИ:
   - "ще"
   - "інші"
   - "що ще є"
   - "покажи інші варіанти"
   - "цей не хочу"
   - "давай інші"

   тоді викликай findProducts.

2. При такому повторному пошуку ОБОВ'ЯЗКОВО
   передавай усі ці ID у excludeProductIds.

3. Якщо клієнт ВИБИРАЄ товар, який уже був знайдений
   і показаний йому, НЕ викликай findProducts повторно.

4. Вибір клієнта потрібно визначати серед товарів,
   які вже повернув findProducts.

5. Кожен товар, повернутий findProducts, має реальний ID.
   НІКОЛИ не вигадуй productId.

6. Якщо клієнт каже:
   - "беру блакитний"
   - "беру чорний"
   - "цей беру"
   - "хочу цей"
   - "беру 8/256"
   - "мені перший"
   
   спочатку визнач, який із РАНІШЕ ПОКАЗАНИХ товарів
   відповідає вибору клієнта.

7. Не запускай новий findProducts тільки для того,
   щоб повторно знайти вже вибраний товар.

8. Коли потрібно створити заявку на вибраний товар,
   передай його реальний ID у createLead через productId.

9. excludeProductIds використовується ТІЛЬКИ для пошуку
   нових/інших товарів і НІКОЛИ не повинен заважати
   вибору товару, який клієнт уже вибрав.
`
    : `

ПРАВИЛА ПОШУКУ ТОВАРІВ:

1. Якщо використовуєш findProducts вперше,
   excludeProductIds має бути [].

2. Якщо findProducts повернув товари,
   запам'ятай їхні реальні ID.

3. Якщо клієнт вибирає один із уже показаних товарів,
   НЕ викликай findProducts повторно.

4. Для створення заявки використовуй реальний ID
   вибраного товару через createLead.productId.

5. НІКОЛИ не вигадуй productId.
`

const shownProductsInstruction =
  shownProducts.length > 0
    ? `

ТОВАРИ, ЯКІ ВЖЕ БУЛИ ПОКАЗАНІ КЛІЄНТУ:

${shownProducts
  .map(product => `ID ${product.id} — ${product.name}`)
  .join('\n')}

ПРАВИЛА ВИБОРУ ТОВАРУ:

Якщо клієнт вибирає товар, який вже був показаний,
НЕ викликай findProducts повторно.

Приклади:

"Беру блакитний"
"Беру чорний"
"Беру перший"
"Беру другий"
"Цей беру"
"Хочу 8/256"
"Мені той за 11999"

У таких випадках визнач товар серед уже показаних
товарів і використовуй його РЕАЛЬНИЙ ID.

Коли створюєш заявку, передай цей ID:

createLead({
  productId: ID_ВИБРАНОГО_ТОВАРУ
})

НІКОЛИ не вигадуй productId.

НЕ використовуй findProducts повторно лише для того,
щоб знайти товар, який вже був показаний клієнту.
`
    : ''

    const result = await generateText({
      model: openai(mobiConfig.model),

      system:
        `${systemPrompt}${exclusionInstruction}${shownProductsInstruction}`,
      messages: toModelMessages(messages),

      tools: openAITools,

      stopWhen: stepCountIs(5)
    })

    const products = collectProducts(result)

    return {
      text: result.text,
      lead,
      mode,
      products,
     
    }
  }
}

export default new MobiAgent()