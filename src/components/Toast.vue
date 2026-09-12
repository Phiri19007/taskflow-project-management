
<script setup lang="ts">

import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X,
} from "lucide-vue-next";

import {
    computed,
} from "vue";

import {
    useToastStore,
} from "@/services/stores/toast.store";


const toastStore =
    useToastStore();


const icon = computed(() => {

    switch (toastStore.type) {

        case "success":
            return CheckCircle;

        case "error":
            return XCircle;

        case "warning":
            return AlertTriangle;

        default:
            return Info;

    }

});


const colorClass =
    computed(() => {

        switch (toastStore.type) {

            case "success":
                return "bg-green-50 text-green-700 border-green-200";

            case "error":
                return "bg-red-50 text-red-700 border-red-200";

            case "warning":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";

            default:
                return "bg-blue-50 text-blue-700 border-blue-200";

        }

    });

</script>


<template>

    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-3 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-3 opacity-0"
    >

        <div
            v-if="toastStore.visible"
            class="fixed bottom-5 right-5 z-9999"
        >

            <div
                class="flex min-w-70 max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl"
                :class="colorClass"
            >

                <component
                    :is="icon"
                    class="h-5 w-5 shrink-0"
                />

                <p
                    class="flex-1 text-sm font-medium"
                >
                    {{ toastStore.message }}
                </p>


                <button
                    type="button"
                    class="shrink-0 opacity-50 transition hover:opacity-100"
                    @click="toastStore.hide()"
                >

                    <X
                        class="h-4 w-4"
                    />

                </button>

            </div>

        </div>

    </Transition>

</template>

