import { z } from 'zod'

export function defineTool<T extends z.ZodTypeAny>(config: {
  name: string
  description: string
  schema: T
  handler: (input: z.infer<T>) => Promise<any>
}) {
  return config
}