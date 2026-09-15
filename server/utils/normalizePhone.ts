export function normalizePhone(phone: string): string {
  let value = String(phone ?? '').replace(/\D/g, '')

  // 0977777777 -> 380977777777
  if (value.length === 10 && value.startsWith('0')) {
    value = `38${value}`
  }

  // 80977777777 -> 380977777777
  if (value.length === 11 && value.startsWith('80')) {
    value = `3${value}`
  }

  return value
}

export function isValidUkrainianPhone(phone: string): boolean {
  return /^380\d{9}$/.test(normalizePhone(phone))
}