export async function dclinkRequest(
  method: string,
  params: Record<string, string> = {}
) {
  const config = useRuntimeConfig()

  const formData = new FormData()

  formData.append('login', String(config.dclinkLogin).trim())
  formData.append('password', String(config.dclinkPassword).trim())

  for (const [key, value] of Object.entries(params)) {
    formData.append(key, String(value))
  }

  const url = `https://api.dclink.com.ua/api/${method}`

  console.log('DCLink URL:', url)
  console.log('DCLink login:', config.dclinkLogin)

  return await $fetch(url, {
    method: 'POST',
    body: formData
  })
}   