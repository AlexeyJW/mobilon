import { generateText, stepCountIs } from 'ai'
import { openai } from './providers/openai'
import { systemPrompt } from './prompts'
import { mobiConfig } from './config'
//==================================================================
import type { ChatResponse } from '../../../types/chat-response'
import type { LeadDraft } from '../../../types/lead'
import type { ConversationMode } from '../../../types/conversation'
import type { MobiMessage } from '../../../types/mobi'

import { openAITools } from './tools/openai-tools'
import { toModelMessages } from './mappers/messages'

export class MobiAgent {

  async chat(

    messages: MobiMessage[],

    lead: LeadDraft,

    mode: ConversationMode

  ): Promise<ChatResponse> {

    const result = await generateText({

      model: openai(mobiConfig.model),

      system: systemPrompt,

      messages: toModelMessages(messages),

      tools: openAITools,

      stopWhen: stepCountIs(5)

    })

    return {

      text: result.text,

      lead,

      mode

    }

  }

}

export default new MobiAgent()