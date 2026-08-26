import { z } from 'zod'

export const FindProductsSchema = z.object({
  query: z.string().describe('Що шукає клієнт: назва, бренд, категорія або тип товару'),

  minPrice: z
    .number()
    .optional()
    .describe('Мінімальна ціна товару, якщо клієнт її вказав'),

  maxPrice: z
    .number()
    .optional()
    .describe('Максимальна ціна товару, якщо клієнт вказав бюджет або верхню межу'),
  
   excludeProductIds: z
    .array(z.number().int())
    .optional()
    .default([])
    .describe(
      'ID товарів, які вже були показані клієнту або які клієнт попросив не пропонувати повторно'
    )
})

export type FindProductsInput = z.infer<typeof FindProductsSchema>