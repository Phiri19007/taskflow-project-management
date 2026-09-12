<script setup lang="ts">
 import NavBar from '@/components/NavBar.vue';
 import HeroSection from '@/components/home/HeroSection.vue';
 import FeaturesSection from '@/components/home/FeaturesSection.vue';
 import CallToAction from '@/components/home/CallToAction.vue';
 import Footer from '@/components/Footer.vue';
 import AboutSection from '@/components/home/AboutSection.vue';
 import PricingSection from '@/components/home/PricingSection.vue';

</script>
<template>
  <main class="bg-linear-to-b from-slate-50 via-white to-slate-50 text-slate-900 antialiased scroll-smooth">
    <NavBar/>
    <HeroSection/>
    <FeaturesSection/>
    <AboutSection/>
    <PricingSection/>
    <CallToAction/>
    <Footer/>
  </main>
</template>
