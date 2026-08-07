import type { LeadDraft } from './lead'
import type { ConversationMode } from './conversation'
import type { MobiMessage } from './mobi'

export interface ChatRequest {

  messages: MobiMessage[]

  lead: LeadDraft

  mode: ConversationMode

}