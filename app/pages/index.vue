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
  link: [
    {
      rel: 'canonical',
     href: "https://mobilon.com.ua/"
    }
  ]
})

</script>