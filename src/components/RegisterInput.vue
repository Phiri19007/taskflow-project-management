<script setup lang="ts">
import { useAttrs } from 'vue'

interface Props {
  type?: string
  placeholder?: string
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()
</script>

<template>
  <input
    v-bind="attrs"
    :type="props.type || 'text'"
    :placeholder="props.placeholder"
    :value="props.modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm
           text-slate-900 placeholder:text-slate-400 transition
           focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
  />
</template>