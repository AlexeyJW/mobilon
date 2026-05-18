// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui','@nuxt/image','@nuxtjs/sitemap','@nuxtjs/color-mode'],
   colorMode: {
    classSuffix: ''
  },
  sitemap: {
    siteUrl: 'https://mobilon-seven.vercel.app'
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Мобілон - Налаштування смартфонів',
      meta: [
        { name: 'description', content: 'Послуги з налаштування смартфонів' },
        { name: 'keywords', content: 'nuxt, seo, сайт, налаштування, перенесення даних, смартфони, чистка смартфонів від вірусів ' },
        { name: 'author', content: 'Олексій' },

        // Open Graph (Facebook, Telegram)
        { property: 'og:title', content: 'Мобілон' },
        { property: 'og:description', content: 'Послуги з налаштування смартфонів' },
        { property: 'og:image', content: '/favicon.ico' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]

  }
 
}
})