import { readBody } from 'h3'
import type { ChatRequest } from '../../../types/chat'

import mobiAgent from '../../services/mobi/agent'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<ChatRequest>(event)

    return await mobiAgent.chat(
      body.messages,
      body.lead,
      body.mode,
      body.excludeProductIds || [],
      body.shownProducts || []
    )

  } catch (e) {
    console.error('Mobi ERROR:', e)
    throw e
  }
})