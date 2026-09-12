<script setup lang="ts">
interface Props {
  type?: string
  placeholder?: string
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :type="props.type || 'text'"
    :placeholder="props.placeholder"
    :value="props.modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="mt-2 w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
           text-slate-900 placeholder:text-slate-400
           focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900
           transition"
  />
</template>