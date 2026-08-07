import { tool } from 'ai'

import findProductsTool from './findProducts'
import createLeadTool from './createLead'

export const openAITools = {

  [findProductsTool.name]: tool({

    description: findProductsTool.description,

    inputSchema: findProductsTool.schema,

    execute: findProductsTool.handler

  }),

  [createLeadTool.name]: tool({

    description: createLeadTool.description,

    inputSchema: createLeadTool.schema,

    execute: createLeadTool.handler

  })

}