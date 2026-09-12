<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  fullWidth: false,
  disabled: false,
  type: 'button'
})
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="[
      // base layout (matches your card button style)
      'mt-8 rounded-xl py-2.5 text-sm font-medium',
      'transition-all duration-200 ease-out',
      'cursor-pointer',
      'active:scale-[0.98]',

      // focus + disabled
      'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',

      // full width always (like your example)
      'w-full',

      // PRIMARY (featured / dark card CTA)
      props.variant === 'primary' &&
        'bg-white text-slate-900 hover:bg-slate-100',

      // SECONDARY (light cards)
      props.variant === 'secondary' &&
        'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
    ]"
  >
    <slot />
  </button>
</template>