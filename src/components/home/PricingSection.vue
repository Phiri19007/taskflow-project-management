<script setup lang="ts">
import PricingCard from '@/components/PricingCard.vue'

const plans = [
  {
    title: 'Starter',
    description: 'Good for individuals and personal use',
    price: '$0',
    note: 'For people just getting started',
    buttonText: 'Get Started',
    featured: false,
    features: [
      'Simple task views',
      'Personal progress tracking',
      'Basic project boards'
    ]
  },
  {
    title: 'Pro',
    description: 'Best for teams working together',
    price: '$12',
    priceSuffix: 'per user/month',
    note: 'Most popular plan',
    buttonText: 'Start Pro',
    featured: true,
    features: [
      'Work together as a team',
      'Shared project timelines',
      'Better progress tracking',
      'Real-time updates'
    ]
  },
  {
    title: 'Enterprise',
    description: 'For large teams and companies',
    price: 'Custom',
    note: 'Tailored for your organization',
    buttonText: 'Contact Sales',
    featured: false,
    features: [
      'Advanced user control',
      'Strong security options',
      'Custom integrations'
    ]
  }
]
</script>

<template>
  <section
    id="pricing"
    class="relative py-32 bg-linear-to-b from-slate-100 via-white to-slate-50 border-t border-slate-200"
  >
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-30 left-1/2 -translate-x-1/2 w-150 h-150 bg-slate-200/40 blur-3xl rounded-full"
      />
    </div>

    <div class="relative max-w-6xl mx-auto px-6">
      <div class="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <span class="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Plans & Pricing
        </span>

        <h2 class="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
          Simple pricing that grows with you
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
        <PricingCard
          v-for="plan in plans"
          :key="plan.title"
          :title="plan.title"
          :description="plan.description"
          :price="plan.price"
          :price-suffix="plan.priceSuffix"
          :note="plan.note"
          :button-text="plan.buttonText"
          :featured="plan.featured"
          :features="plan.features"
        />
      </div>
    </div>
  </section>
</template>