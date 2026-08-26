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
    excludeProductIds: number[] = []
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

Коли викликаєш findProducts, НЕ обирай ці товари повторно.
Обов'язково передай ці ID у excludeProductIds.

Якщо клієнт просить:
- "ще"
- "інші"
- "що ще є"
- "покажи інші варіанти"
- "цей не хочу"
- "давай інші"

зберігай усі попередні фільтри
(категорія, бренд, бюджет тощо),
але шукай товари без виключених ID.
`
        : `

Це перший пошук товарів у поточному діалозі.
Якщо використовуєш findProducts, excludeProductIds має бути [].
`

    const result = await generateText({
      model: openai(mobiConfig.model),

      system:
        `${systemPrompt}${exclusionInstruction}`,

      messages: toModelMessages(messages),

      tools: openAITools,

      stopWhen: stepCountIs(5)
    })

    const products = collectProducts(result)

    return {
      text: result.text,
      lead,
      mode,
      products
    }
  }
}

export default new MobiAgent()