export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') {
    return
  }

  try {
    await $fetch('/api/auth', {
      headers: useRequestHeaders(['cookie'])
    })
  } catch {
    return navigateTo('/admin/login')
  }
})