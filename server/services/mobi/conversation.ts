import type { ConversationState, ConversationMode } from '../../../types/conversation'
import type { MobiMessage } from '../../../types/mobi'
import type { LeadDraft } from '../../../types/lead'

export class Conversation {

  state: ConversationState

  constructor(
    messages: MobiMessage[],
    lead?: LeadDraft,
    mode: ConversationMode = 'chat'
  ) {

    this.state = {

      messages,

      lead: lead ?? {},

      mode,

      currentStep: 'idle'

    }

  }

  get messages() {
    return this.state.messages
  }

  get lead() {
    return this.state.lead
  }

  get mode() {
    return this.state.mode
  }

  setMode(mode: ConversationMode) {
    this.state.mode = mode
  }

  isLeadFlow() {
    return this.state.mode === 'lead'
  }

  updateLead(data: Partial<LeadDraft>) {

    this.state.lead = {

      ...this.state.lead,

      ...data

    }

  }

  clearLead() {

    this.state.lead = {}

    this.state.mode = 'chat'

    this.state.currentStep = 'idle'

  }

}