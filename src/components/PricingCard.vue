<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue'

interface Props {
  title: string
  description: string
  price: string
  priceSuffix?: string
  note: string
  features: string[]
  buttonText: string
  featured?: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    :class="[
      'h-full min-h-120 rounded-2xl p-8 flex flex-col justify-between relative border transition',
      featured
        ? 'bg-slate-900 text-white border-slate-800 shadow-md'
        : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
    ]"
  >
    <div v-if="featured"
      class="absolute -top-3 right-6 text-[10px] uppercase font-bold tracking-widest bg-white text-slate-900 px-3 py-1 rounded-full shadow-sm">
      Most Popular
    </div>

    <div>
      <div :class="featured ? 'border-b border-slate-800 pb-6' : 'border-b border-slate-100 pb-6'">
        <h3 class="text-lg font-semibold">
          {{ title }}
        </h3>

        <p :class="featured ? 'text-slate-400 mt-1 text-xs' : 'text-slate-500 mt-1 text-xs'">
          {{ description }}
        </p>

        <div class="mt-6 flex items-baseline">
          <span class="text-4xl font-bold">
            {{ price }}
          </span>

          <span
            v-if="priceSuffix"
            :class="featured ? 'text-slate-400 text-xs ml-2' : 'text-slate-500 text-xs ml-2'"
          >
            {{ priceSuffix }}
          </span>
        </div>

        <p :class="featured ? 'text-slate-400 mt-2 text-xs' : 'text-slate-400 mt-2 text-xs'">
          {{ note }}
        </p>
      </div>

      <div class="pt-6">
        <ul class="space-y-3">
          <li
            v-for="feature in features"
            :key="feature"
            class="flex items-center gap-2"
          >
            ✓ {{ feature }}
          </li>
        </ul>
      </div>
    </div>
  <BaseButton
    :variant="featured ? 'primary' : 'secondary'"
    full-width
  >
    {{ buttonText }}
  </BaseButton>
  </div>
</template>