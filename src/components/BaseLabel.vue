<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <label class="text-[11px] uppercase tracking-widest text-slate-500 font-medium">
    {{ text }}
  </label>
</template>