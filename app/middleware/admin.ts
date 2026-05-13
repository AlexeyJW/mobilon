export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return

  try {
    await $fetch('/api/auth')
  } catch {
    return navigateTo('/admin/login')
  }
})