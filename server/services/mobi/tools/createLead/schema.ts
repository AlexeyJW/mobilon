import { z } from 'zod'

export const CreateLeadSchema = z.object({
  customerName: z.string().min(1),

  phone: z.string().min(1),

  city: z.string().optional(),

  comment: z.string().optional(),

  productId: z
    .number()
    .int()
    .positive()
    .describe('ID конкретного товару, який клієнт вибрав із результатів пошуку')
})

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>