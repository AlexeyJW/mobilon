import { defineTool } from '../registry'

import { FindProductsSchema } from './schema'

import { findProducts } from './findProducts'

export default defineTool({

  name: 'findProducts',

  description: `
Search products in Mobilon database.

Use this tool whenever the user asks about:

- phones
- smartphones
- Samsung
- Apple
- Xiaomi
- Motorola
- accessories
- chargers
- headphones
- cables
- availability
- price
- recommendation

Never invent products.

Always search first.
`,

  schema: FindProductsSchema,

  handler: findProducts

})