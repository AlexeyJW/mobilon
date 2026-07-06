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
  htmlAttrs: {
    lang: 'uk'
},

  css: ['~/assets/css/main.css'],
app: {
  head: {
    htmlAttrs: {
      lang: 'uk'
    },

    title: 'Mobilon',

    titleTemplate: '%s',

    meta: [
      {
        charset: 'utf-8'
      },

      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },

     {
        name: 'description',
        content: 'Ремонт телефонів, планшетів і ноутбуків у Солотвині. Заміна дисплеїв, акумуляторів, розємів, налаштування смартфонів та перенесення даних.'
      },

      {
        property: 'og:type',
        content: 'website'
      },

      {
        property: 'og:locale',
        content: 'uk_UA'
      },

      {
        property: 'og:site_name',
        content: 'Mobilon'
      }
    ],

    link: [
      {
        rel: 'icon',
        href: '/favicon.ico'
      }
    ]
  }
}
})