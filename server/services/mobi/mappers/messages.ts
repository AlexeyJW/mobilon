import type { ModelMessage } from 'ai'
import type { MobiMessage } from '../../../../types/mobi'

export function toModelMessages(messages: MobiMessage[]): ModelMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.text
  }))
}