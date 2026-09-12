<script setup>
defineProps({
  label: {
    type: String,
    default: 'Add task',
  },
})

const emit = defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="inline-flex
           h-9
           shrink-0
           items-center
           gap-1.5
           rounded-xl
           bg-slate-900
           px-3.5
           text-sm
           font-medium
           text-white
           transition-colors
           hover:bg-slate-800"
    @click="emit('click')"
  >
    <span
      class="text-base
             leading-none"
    >
      +
    </span>

    {{ label }}
  </button>
</template>