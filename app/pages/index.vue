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
  title: 'Продаж Cмартфонів | Купити смартфон | Ремонт телефонів у Солотвині | Mobilon',
  description:
    'Ремонт телефонів Samsung, iPhone, Xiaomi та інших брендів у Солотвині. Заміна дисплеїв, акумуляторів, розʼємів, перенесення даних та налаштування смартфонів.',
  ogTitle: 'Купити телефон | Купити нові смартфони |Ремонт телефонів у Солотвині | Mobilon',
  ogDescription:
    'Професійний ремонт телефонів у Солотвині. Samsung, iPhone, Xiaomi, Redmi, Realme та інші.',
  ogType: 'website'
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

        logo: 'https://mobilon.com.ua/images/mobilon-logo.png',

        image: 'https://mobilon.com.ua/images/og-mobilon.png',

        address: {
          '@type': 'PostalAddress',
          streetAddress: 'вул. Дружби Народів, 3',
          addressLocality: 'Солотвино',
          addressRegion: 'Закарпатська область',
          addressCountry: 'UA'
        }
      })
    }
  ]
})
</script>