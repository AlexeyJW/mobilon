import { generateText } from 'ai'
import { openai } from './providers/openai'

import { systemPrompt } from './prompts'
import type { ChatResponse } from './types'
import { mobiConfig } from './config'

class MobiService {

 async chat(message: string): Promise<ChatResponse> {

  const result = await generateText({

    model: openai(mobiConfig.model),

    system: systemPrompt,

    prompt: message

  })

  return {

    text: result.text

  }

}

}

export default new MobiService()