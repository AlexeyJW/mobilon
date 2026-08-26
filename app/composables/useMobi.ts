import type { MobiMessage } from '../../types/mobi'
import type { LeadDraft } from '../../types/lead'
import type { ConversationMode } from '../../types/conversation'

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

  const mode = useState<ConversationMode>('mobi-mode', () => 'chat')

  // Товари, які вже були показані клієнту
  const shownProductIds = useState<number[]>(
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

    shownProductIds.value = []
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

  function addShownProductIds(ids: number[]) {
    shownProductIds.value = Array.from(
      new Set([
        ...shownProductIds.value,
        ...ids
      ])
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
      const excludeProductIds = Array.from(
        new Set([
          ...shownProductIds.value,
          ...rejectedProductIds.value
        ])
      )

      const response = await $fetch<{
        text: string
        lead: LeadDraft
        mode: ConversationMode

        // Бажано, щоб mobiAgent повертав знайдені товари
        // з їхніми ID.
        products?: Array<{
          id: number
        }>

        // Якщо пізніше агент буде явно повертати
        // відхилені товари.
        rejectedProductIds?: number[]
      }>('/api/mobi/chat', {
        method: 'POST',
        body: {
          messages: messages.value,
          lead: lead.value,
          mode: mode.value,
          excludeProductIds
        }
      })

      addMessage('assistant', response.text)

      lead.value = response.lead
      mode.value = response.mode

      // Запам'ятовуємо товари, які були показані
      if (response.products?.length) {
        addShownProductIds(
          response.products.map(product => product.id)
        )
      }

      // Запам'ятовуємо товари, які були відхилені
      if (response.rejectedProductIds?.length) {
        response.rejectedProductIds.forEach(id => {
          rejectProductId(id)
        })
      }
    } catch (error) {
      console.error('Mobi send error:', error)

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

    shownProductIds,
    rejectedProductIds,

    show,
    hide,
    clear,

    send,
    addMessage,

    addShownProductIds,
    rejectProductId
  }
}