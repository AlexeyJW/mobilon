import type { LeadDraft } from './lead'
import type { ConversationMode } from './conversation'

export interface ChatResponse {

  text: string

  lead: LeadDraft

  mode: ConversationMode

  products?: Array<{
    id: number
    name?: string
   }>

}