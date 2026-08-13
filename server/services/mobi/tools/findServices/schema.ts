import { z } from 'zod'

export const FindServicesSchema = z.object({
  query: z
    .string()
    .describe(
      'Що шукає клієнт: назва послуги, опис або категорія'
    ),

  minPrice: z
    .number()
    .optional()
    .describe(
      'Мінімальна ціна послуги, якщо клієнт її вказав'
    ),

  maxPrice: z
    .number()
    .optional()
    .describe(
      'Максимальна ціна послуги, якщо клієнт вказав бюджет або верхню межу'
    )
})

export type FindServicesInput =
  z.infer<typeof FindServicesSchema>