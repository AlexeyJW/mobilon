export function normalizeProductText(
  value: unknown
) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\u00a0/g, ' ')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[,_;+]/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenizeProductText(
  value: unknown
) {
  return normalizeProductText(value)
    .split(/[\s/\\-]+/)
    .map(token => token.trim())
    .filter(token => token.length >= 2)
}