<template>
  <div>
    <RevealOnScroll>
      <HeroMobile />
      <BenefitsMobile />
      <ServicesMobile />
     <StepsMobile />
     <ContactMobile />
    </RevealOnScroll>
    
  </div>
</template>    
<script setup>
useSeoMeta({
  title: 'Ремонт телефонів у Солотвині | Mobilon',
  description:
    'Ремонт телефонів Samsung, iPhone, Xiaomi та інших брендів у Солотвині. Заміна дисплеїв, акумуляторів, розʼємів, перенесення даних та налаштування смартфонів.',
  ogTitle: 'Ремонт телефонів у Солотвині | Mobilon',
  ogDescription:
    'Професійний ремонт телефонів у Солотвині. Samsung, iPhone, Xiaomi, Redmi, Realme та інші.',
  ogType: 'website'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://mobilon-seven.vercel.app'
    }
  ]
})
</script>