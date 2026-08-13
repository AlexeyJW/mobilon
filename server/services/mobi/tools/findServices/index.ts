import { defineTool } from '../registry'

import { FindServicesSchema } from './schema'
import { findServices } from './findServices'

export default defineTool({
  name: 'findServices',

  description: `
Search services in Mobilon database.

Use this tool whenever the user asks about:

- services
- service prices
- service cost
- phone setup
- smartphone setup
- data transfer
- phone configuration
- account setup
- application installation
- optimization
- available services
- service recommendations

Always search the service catalog first.

Only return services that exist in the Mobilon database.
Never invent services or prices.

Only active services should be offered to customers.
`,

  schema: FindServicesSchema,

  handler: findServices
})