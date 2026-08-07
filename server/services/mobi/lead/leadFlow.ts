import type { LeadDraft } from '../../../../types/lead'

import { nextQuestion } from './nextQuestion'
import { getQuestion } from './questions'
import { parseLeadMessage } from './leadParser'

export class LeadFlow {

  private lead: LeadDraft

  constructor(lead?: LeadDraft) {

   this.lead = lead ?? {}

}

  get data() {

    return this.lead

  }

  process(message: string) {

    const field = nextQuestion(this.lead)

    if (!field) {

      return {

        completed: true,

        lead: this.lead

      }

    }

    const parsed = parseLeadMessage(message, field)

    this.lead = {

      ...this.lead,

      ...parsed

    }

    const next = nextQuestion(this.lead)

    if (!next) {

      return {

        completed: true,

        lead: this.lead

      }

    }

    return {

      completed: false,

      lead: this.lead,

      nextField: next,

      question: getQuestion(next)

    }

  }

}