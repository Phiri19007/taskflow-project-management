```vue
<script setup lang="ts">
import { HelpCircle } from "lucide-vue-next";

const emit = defineEmits<{
    "contact-support": [];
}>();
</script>

<template>
    <!-- Header Section -->
    <div
        class="flex items-center justify-between border-b border-slate-200/60 pb-5 shrink-0"
    >
        <div>
            <h1
                class="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"
            >
                <HelpCircle class="w-5 h-5 text-slate-600" />

                Help Center
            </h1>

            <p
                class="text-[12px] text-slate-400 font-medium mt-0.5"
            >
                Access documentation, system guides, and immediate support
                networks.
            </p>
        </div>

        <button
            type="button"
            @click="emit('contact-support')"
            class="
                text-[12px]
                text-blue-600
                bg-blue-50
                hover:bg-blue-100
                font-bold
                px-4
                py-2
                rounded-xl
                transition-all
                shadow-sm
            "
        >
            Contact Support
        </button>
    </div>
</template>
```
