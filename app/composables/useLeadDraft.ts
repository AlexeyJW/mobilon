import type { LeadDraft } from '../../types/lead'

export const useLeadDraft = () => {

  const draft = useState<LeadDraft>('lead-draft', () => ({}))

  function reset() {
    draft.value = {}
  }

  function update(data: Partial<LeadDraft>) {
    draft.value = {
      ...draft.value,
      ...data
    }
  }

  return {

    draft,

    update,

    reset

  }

}