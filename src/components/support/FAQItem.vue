<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";

defineProps<{
  question: string;
  answer: string;
  open: boolean;
}>();

defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <div class="border-b border-gray-200 last:border-0">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-4 py-5 text-left"
      @click="$emit('toggle')"
    >
      <span class="font-medium text-gray-900">
        {{ question }}
      </span>

      <ChevronDown
        :size="18"
        class="shrink-0 text-gray-400 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <div
      v-if="open"
      class="pb-5 pr-8 text-sm text-gray-500 leading-6"
    >
      {{ answer }}
    </div>
  </div>
</template>