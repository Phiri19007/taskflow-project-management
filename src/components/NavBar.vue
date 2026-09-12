<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {RouterLink} from 'vue-router';

const activeSection = ref('home')
const sections = ['home', 'about', 'pricing']

const setActiveSection = () => {
  let current = 'home'

  for (const id of sections) {
    const el = document.getElementById(id)
    if (!el) continue

    const rect = el.getBoundingClientRect()

    if (rect.top <= 120 && rect.bottom >= 120) {
      current = id
    }
  }

  activeSection.value = current
}

onMounted(() => {
  window.addEventListener('scroll', setActiveSection)
  setActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', setActiveSection)
})
</script>

<template>
  <!-- Navbar -->
  <header class="border-b border-slate-200 bg-white/80 backdrop-blur fixed w-full top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

      <!-- Logo -->
      <div class="text-xl font-semibold tracking-tight text-slate-900">
        TaskFlow
      </div>

      <!-- Center Links -->
      <nav class="hidden md:flex items-center space-x-8 text-sm text-slate-600">

        <!-- HOME -->
        <a
          href="#home"
          class="relative py-1 transition-colors hover:text-slate-900"
          :class="activeSection === 'home' ? 'text-slate-900' : ''"
        >
          Home
          <span
            class="absolute left-0 -bottom-1 h-0.5 bg-slate-900 transition-all duration-200"
            :class="activeSection === 'home' ? 'w-full' : 'w-0'"
          />
        </a>

        <!-- ABOUT -->
        <a
          href="#about"
          class="relative py-1 transition-colors hover:text-slate-900"
          :class="activeSection === 'about' ? 'text-slate-900' : ''"
        >
          About
          <span
            class="absolute left-0 -bottom-1 h-0.5 bg-slate-900 transition-all duration-200"
            :class="activeSection === 'about' ? 'w-full' : 'w-0'"
          />
        </a>

        <!-- PRICING -->
        <a
          href="#pricing"
          class="relative py-1 transition-colors hover:text-slate-900"
          :class="activeSection === 'pricing' ? 'text-slate-900' : ''"
        >
          Pricing
          <span
            class="absolute left-0 -bottom-1 h-0.5 bg-slate-900 transition-all duration-200"
            :class="activeSection === 'pricing' ? 'w-full' : 'w-0'"
          />
        </a>

      </nav>

      <!-- Right Actions -->
      <div class="hidden md:flex items-center space-x-4">
        <router-link to="/signin" class="text-sm text-slate-600 hover:text-slate-900 transition">
          Sign In
        </router-link>
        <router-link to="/signup" class="text-sm px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
          Sign Up
        </router-link>
      </div>

      <!-- Mobile -->
      <div class="md:hidden text-slate-700">
        <button class="p-1 text-xl">☰</button>
      </div>

    </div>
  </header>
</template>