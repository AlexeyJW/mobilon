import type { LeadDraft } from '../../../../types/lead'

const phoneRegex =
  /(\+?38)?[\s\-()]?(0\d{2})[\s\-()]?(\d{3})[\s\-()]?(\d{2})[\s\-()]?(\d{2})/

export function parseLeadMessage(

  message: string,

  expectedField: keyof LeadDraft

): Partial<LeadDraft> {

  const text = message.trim()

  switch (expectedField) {

    case 'customerName':

      return {

        customerName: text

      }

    case 'phone': {

      const phone = text.match(phoneRegex)

      if (!phone) {

        return {}

      }

      return {

        phone: phone[0].replace(/\D/g, '')

      }

    }

    case 'city':

      return {

        city: text

      }

    case 'comment':

      return {

        comment: text

      }

    default:

      return {}

  }

}