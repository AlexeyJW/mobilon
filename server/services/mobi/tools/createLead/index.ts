import { defineTool } from '../registry'

import { CreateLeadSchema } from './schema'

import { createLead } from './createLead'

export default defineTool({
  name: 'createLead',

  description: 'Створює заявку клієнта',

  schema: CreateLeadSchema,

  handler: createLead
})