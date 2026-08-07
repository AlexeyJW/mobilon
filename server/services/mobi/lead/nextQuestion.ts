import type { LeadDraft } from '../../../../types/lead'

export type LeadField =
  | 'customerName'
  | 'phone'
  | 'city'
  | 'comment'
  | null

export function nextQuestion(lead: LeadDraft): LeadField {

  if (!lead.customerName) {
    return 'customerName'
  }

  if (!lead.phone) {
    return 'phone'
  }

  if (!lead.city) {
    return 'city'
  }

  if (!lead.comment) {
    return 'comment'
  }

  return null

}