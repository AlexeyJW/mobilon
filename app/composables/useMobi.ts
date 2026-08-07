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
  }


  function addMessage(role: 'user' | 'assistant', text: string) {
  messages.value.push({
    id: crypto.randomUUID(),

    role,

    text,

    createdAt: new Date()
  })
}

async function send(text: string) {

  loading.value = true

  addMessage('user', text)

  try {

   const response = await $fetch('/api/mobi/chat', {

  method: 'POST',

  body: {

    messages: messages.value,

    lead: lead.value,

    mode: mode.value

  }

})

addMessage('assistant', response.text)

lead.value = response.lead

mode.value = response.mode

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

    show,

    hide,

    clear,

    send,

    addMessage,
    
    
  }
}