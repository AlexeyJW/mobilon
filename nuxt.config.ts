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
      ],

      sources: [
        '/api/__sitemap__/urls'
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

    title: 'Mobilon — магазин смартфонів та аксесуарів у Солотвині',

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
      content: 'Mobilon — магазин смартфонів та аксесуарів у Солотвині. Смартфони, чохли, захисне скло, зарядні пристрої та допомога з налаштуванням і перенесенням даних.'
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
      },

      {
        property: 'og:image',
        content: 'https://mobilon.com.ua/images/og-mobilon.png'
      },

      {
        property: 'og:image:width',
        content: '1200'
      },

      {
        property: 'og:image:height',
        content: '630'
      },

      {
        property: 'og:image:alt',
        content: 'Mobilon — смартфони, аксесуари та сервіс у Солотвині'
      },

      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },

      {
        name: 'twitter:image',
        content: 'https://mobilon.com.ua/images/og-mobilon.png'
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