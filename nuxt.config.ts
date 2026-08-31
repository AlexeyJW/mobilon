export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui','@nuxt/image','@nuxtjs/sitemap','@nuxtjs/color-mode'],
   colorMode: {
    classSuffix: ''
  },
  runtimeConfig: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    
    dclinkApiUrl: process.env.DCLINK_API_URL,
    dclinkLogin: process.env.DCLINK_LOGIN,
    dclinkPassword: process.env.DCLINK_PASSWORD
  },

  sitemap: {
        siteUrl: 'https://mobilon.com.ua',

        exclude: [
          '/admin/**',
          '/test'
        ]
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

    title: 'Mobilon — магазин телефонів та ремонт у Солотвині',

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
        content: 'Продаж смартфонів та ремонт телефонів, планшетів і ноутбуків у Солотвині. Заміна дисплеїв, акумуляторів, розємів, налаштування смартфонів та перенесення даних.'
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
      },
      {
        rel: 'canonical',
        href: 'https://mobilon.com.ua/'
      }
    ]
  }
}
})