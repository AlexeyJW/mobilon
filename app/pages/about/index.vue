<script setup lang="ts">
useSeoMeta({
  title: 'Про Mobilon — магазин смартфонів та аксесуарів у Солотвині',

  description:
    'Mobilon — магазин смартфонів та аксесуарів у Солотвині. Допоможемо обрати смартфон, підібрати чохол, захисне скло, зарядку та налаштувати новий пристрій.',

  ogTitle:
    'Про Mobilon — магазин смартфонів та аксесуарів у Солотвині',

  ogDescription:
    'Смартфони, аксесуари та допомога з мобільною технікою у Солотвині. Дізнайтеся більше про магазин Mobilon.',

  ogType: 'website',

  ogUrl: 'https://mobilon.com.ua/about',

  ogImage: 'https://mobilon.com.ua/images/og-mobilon.png',

  twitterCard: 'summary_large_image',

  twitterTitle:
    'Про Mobilon — магазин смартфонів та аксесуарів у Солотвині',

  twitterDescription:
    'Смартфони, аксесуари та допомога з мобільною технікою у Солотвині.',

  twitterImage:
    'https://mobilon.com.ua/images/og-mobilon.png'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://mobilon.com.ua/about'
    }
  ]
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://mobilon.com.ua/about'
    }
  ]
})


</script>

<template>
  <div class="px-4 py-10 space-y-20 bg-default">

    <RevealOnScroll>
      <AboutHero />
    </RevealOnScroll>

    <RevealOnScroll>
      <StoreGallery />
    </RevealOnScroll>

    <AboutStore />

    <AboutTeam />

    <AboutBenefits />

    <AboutFaq />

    <AboutCta />

  </div>
</template>