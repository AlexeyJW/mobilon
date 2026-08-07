import type { MobiMessage } from './mobi'
import type { LeadDraft } from './lead'

export type ConversationMode =
  | 'chat'
  | 'lead'

export type ConversationStep =
  | 'idle'
  | 'select_product'
  | 'wait_name'
  | 'wait_phone'
  | 'wait_city'
  | 'wait_comment'
  | 'confirm'
  | 'create_lead'
  | 'done'

export interface ConversationState {

  messages: MobiMessage[]

  lead: LeadDraft

  mode: ConversationMode

  currentStep: ConversationStep

}