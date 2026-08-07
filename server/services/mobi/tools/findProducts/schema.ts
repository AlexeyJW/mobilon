import { z } from 'zod'

export const FindProductsSchema = z.object({
  query: z.string().describe('Пошуковий запит')
})

export type FindProductsInput = z.infer<typeof FindProductsSchema>