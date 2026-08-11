export default defineEventHandler(async (event) => {
  deleteCookie(event, 'admin-session', {
    path: '/'
  })

  return {
    ok: true
  }
})