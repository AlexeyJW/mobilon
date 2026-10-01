export async function dclinkRequest(
  method: string,
  params: Record<string, string> = {}
) {
  const config = useRuntimeConfig()

  const formData = new FormData()

  formData.append('login', String(config.dclinkLogin))
  formData.append('password', String(config.dclinkPassword))

  for (const [key, value] of Object.entries(params)) {
    formData.append(key, String(value))
  }

  const url = `${config.dclinkApiUrl.replace(/\/$/, '')}/${method}`


  const response = await $fetch.raw(url, {
    method: 'POST',
    body: formData
  })


  return response._data
}