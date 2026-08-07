import { z } from 'zod'

export const CreateLeadSchema = z.object({

  customerName: z.string(),

  phone: z.string(),

  city: z.string().optional(),

  comment: z.string().optional(),

  productId: z.number().optional()

})

export type CreateLeadInput =
  z.infer<typeof CreateLeadSchema>