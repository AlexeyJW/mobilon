import type { H3Event } from 'h3'
import { getCurrentUser } from './auth'

export default async function requireAdmin(event: H3Event) {
  const user = await getCurrentUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid session'
    })
  }

  if (!user.active) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found or inactive'
    })
  }

  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  return user
}