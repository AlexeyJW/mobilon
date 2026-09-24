<template>
  <div>
    <!-- Головний екран -->
    <RevealOnScroll>
      <HeroMobileNew />
    </RevealOnScroll>

    <!-- Популярні товари — одразу показуємо вітрину -->
    <RevealOnScroll>
      <PopularProductsMobile />
    </RevealOnScroll>

    <RevealOnScroll>

      <MobiPicker />

    </RevealOnScroll>

    <!-- Переваги Mobilon -->
    <RevealOnScroll>
      <BenefitsMobile />
    </RevealOnScroll>

    <!-- Послуги -->
    <RevealOnScroll>
      <ServicesMobileNew />
    </RevealOnScroll>

    <!-- Бренди -->
    <RevealOnScroll>
      <BrandMobile />
    </RevealOnScroll>

    <!-- Порадитись з Мобі / Залишити заявку -->
    <RevealOnScroll>
      <ContactMobile />
    </RevealOnScroll>

    <!-- Карта -->
    <RevealOnScroll>
      <ContactMap />
    </RevealOnScroll>
  </div>
</template>
<script setup>
useSeoMeta({
  title: 'Магазин смартфонів та аксесуарів у Солотвині | Mobilon',

  description:
    'Mobilon — магазин смартфонів та аксесуарів у Солотвині. Купуйте смартфони, чохли, захисне скло, зарядні пристрої та отримуйте допомогу з налаштуванням техніки.',

  ogTitle:
    'Mobilon — смартфони та аксесуари у Солотвині',

  ogDescription:
    'Смартфони, аксесуари, захист та допомога з мобільною технікою. Магазин Mobilon у Солотвині.',

  ogType: 'website',

  ogUrl: 'https://mobilon.com.ua/',

  ogImage: 'https://mobilon.com.ua/images/og-mobilon.png',

  twitterCard: 'summary_large_image',

  twitterImage:
    'https://mobilon.com.ua/images/og-mobilon.png'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Store',
        '@id': 'https://mobilon.com.ua/#store',

        name: 'Mobilon',

        description:
          'Магазин смартфонів та аксесуарів у Солотвині. Смартфони, чохли, захисне скло, зарядні пристрої та допомога з налаштуванням і перенесенням даних.',

        url: 'https://mobilon.com.ua/',

        telephone: '+380984455233',

        priceRange: '₴₴',

        logo: 'https://mobilon.com.ua/images/logo.png',

        image: 'https://mobilon.com.ua/images/og-mobilon.png',

        sameAs: [
          'https://www.instagram.com/mobilon_ua/'
        ],

        address: {
          '@type': 'PostalAddress',
          streetAddress: 'вул. Дружби Народів, 3',
          addressLocality: 'Солотвино',
          addressRegion: 'Закарпатська область',
          addressCountry: 'UA'
        },

        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday'
            ],
            opens: '09:00',
            closes: '18:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '09:00',
            closes: '15:00'
          }
        ]
      })
    }
  ]
})
</script>