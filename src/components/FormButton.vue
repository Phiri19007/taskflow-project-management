<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit'
  disabled?: boolean
  fullWidth?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
  fullWidth: true,
  loading: false
})
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :class="[
      // base
      'rounded-xl py-3 text-sm font-medium transition-all duration-200 w-full',
      'focus:outline-none focus:ring-2 focus:ring-slate-900/10',

      // 👇 cursor states (IMPORTANT)
      'cursor-pointer disabled:cursor-not-allowed',

      // disabled
      'disabled:opacity-50 disabled:active:scale-100',

      // PRIMARY
      props.variant === 'primary' &&
        'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md active:scale-[0.98]',

      // SECONDARY
      props.variant === 'secondary' &&
        'border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.98]'
    ]"
  >
    <span v-if="!props.loading">
      <slot />
    </span>

    <span v-else class="flex items-center justify-center gap-2">
      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Loading...
    </span>
  </button>
</template>