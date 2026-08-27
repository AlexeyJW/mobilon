import type { MobiMessage } from '../../types/mobi'
import type { LeadDraft } from '../../types/lead'
import type { ConversationMode } from '../../types/conversation'

interface MobiProduct {
  id: number
  name?: string
}

export const useMobi = () => {
  const open = useState<boolean>('mobi-open', () => false)

  const loading = useState<boolean>('mobi-loading', () => false)

  const messages = useState<MobiMessage[]>('mobi-messages', () => [
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      text:
        `👋 Привіт!

Я Мобі.

Допоможу вибрати смартфон, аксесуари або відповім на питання про товари.

З чого почнемо?`,
      createdAt: new Date()
    }
  ])

  const lead = useState<LeadDraft>('mobi-lead', () => ({}))

  const mode = useState<ConversationMode>(
    'mobi-mode',
    () => 'chat'
  )

  // Товари, які агент уже показував клієнту
  const shownProducts = useState<MobiProduct[]>(
    'mobi-shown-products',
    () => []
  )

  // Товари, які клієнт попросив більше не пропонувати
  const rejectedProductIds = useState<number[]>(
    'mobi-rejected-products',
    () => []
  )

  function show() {
    open.value = true
  }

  function hide() {
    open.value = false
  }

  function clear() {
    messages.value = [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text:
          `👋 Привіт!

Я Мобі.

Допоможу вибрати смартфон, аксесуари або відповім на питання про товари.

З чого почнемо?`,
        createdAt: new Date()
      }
    ]

    lead.value = {}
    mode.value = 'chat'

    shownProducts.value = []
    rejectedProductIds.value = []
  }

  function addMessage(
    role: 'user' | 'assistant',
    text: string
  ) {
    messages.value.push({
      id: crypto.randomUUID(),
      role,
      text,
      createdAt: new Date()
    })
  }

  function addShownProducts(products: MobiProduct[]) {
    shownProducts.value = Array.from(
      new Map(
        [
          ...shownProducts.value,
          ...products
        ].map(product => [
          product.id,
          product
        ])
      ).values()
    )
  }

  function rejectProductId(id: number) {
    if (!rejectedProductIds.value.includes(id)) {
      rejectedProductIds.value.push(id)
    }
  }

  async function send(text: string) {
    const cleanText = text.trim()

    if (!cleanText || loading.value) {
      return
    }

    loading.value = true

    addMessage('user', cleanText)

    try {
      // ВАЖЛИВО:
      // виключаємо тільки відхилені товари.
      // Показані товари не є забороненими.
      const excludeProductIds = Array.from(
        new Set(
          rejectedProductIds.value
        )
      )

      const response = await $fetch<{
        text: string
        lead: LeadDraft
        mode: ConversationMode

        products?: MobiProduct[]

        rejectedProductIds?: number[]
      }>('/api/mobi/chat', {
        method: 'POST',

        body: {
          messages: messages.value,
          lead: lead.value,
          mode: mode.value,

          excludeProductIds,

          // Передаємо AI товари,
          // які він уже показував клієнту
          shownProducts: shownProducts.value
        }
      })

      addMessage(
        'assistant',
        response.text
      )

      lead.value = response.lead
      mode.value = response.mode

      // Зберігаємо товари,
      // які були показані клієнту
      if (response.products?.length) {
        addShownProducts(
          response.products
        )
      }

      // Зберігаємо відхилені товари
      if (response.rejectedProductIds?.length) {
        response.rejectedProductIds.forEach(
          id => rejectProductId(id)
        )
      }

    } catch (error) {
      console.error(
        'Mobi send error:',
        error
      )

      addMessage(
        'assistant',
        'Вибачте, сталася помилка. Спробуйте ще раз.'
      )

    } finally {
      loading.value = false
    }
  }

  return {
    open,
    loading,
    messages,

    lead,
    mode,

    shownProducts,
    rejectedProductIds,

    show,
    hide,
    clear,

    send,
    addMessage,

    addShownProducts,
    rejectProductId
  }
}