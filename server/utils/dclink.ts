export async function dclinkAuth() {
  const config = useRuntimeConfig()

  const response = await $fetch<{
    status: number
    result?: string
  }>('https://cerebro.dclink.ua/auth', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },

    body: {
      login: String(config.dclinkLogin).trim(),

      // Тут важливий момент!
      // У документації password виглядає як MD5-хеш.
      password: 'ТУТ_МАЄ_БУТИ_MD5'
    }
  })

  if (response.status !== 1 || !response.result) {
    throw createError({
      statusCode: 401,
      statusMessage: 'DCLink authorization failed'
    })
  }

  return response.result
}