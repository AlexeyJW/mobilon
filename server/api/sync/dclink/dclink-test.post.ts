// server/api/dclink-test.post.ts

// server/api/dclink-test.post.ts

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const formData = new FormData()

  formData.append('login', String(config.dclinkLogin).trim())
  formData.append('password', String(config.dclinkPassword).trim())

  const url = 'https://api.dclink.com.ua/api/GetRefItems/json'



  const response = await $fetch.raw(url, {
    method: 'POST',
    body: formData
  })

  return {
    status: response.status,
    response: response._data
  }
})