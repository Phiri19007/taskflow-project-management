<script setup lang="ts">

import { computed } from "vue";
import { FolderKanban, PauseCircle } from "lucide-vue-next";


const props = defineProps<{
    project: string;
}>();


const emit = defineEmits<{
    action: [];
}>();



const headerData = computed(() => {

    switch (props.project) {

        case "Project Done":
            return {
                title: "Completed Projects Directory",
                description:
                    "Review finished projects, delivered milestones, and archived development cycles.",
                icon: FolderKanban,
                button: "Review Reports"
            };


        case "Project On Hold":
            return {
                title: "Projects On Hold",
                description:
                    "Monitor paused projects, pending decisions, and future restart timelines.",
                icon: PauseCircle,
                button: null
            };


        default:
            return {
                title: "Active Projects Directory",
                description:
                    "Track operational development cycles, repositories, and timeline milestones.",
                icon: FolderKanban,
                button: "+ New Project"
            };

    }

});


function handleButtonClick() {
    emit("action");

}

</script>


<template>

<div
    class="flex items-center justify-between border-b border-slate-200/60 pb-4 shrink-0"
>

    <div>

        <h1
            class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"
        >

            <component
                :is="headerData.icon"
                class="w-5 h-5 text-slate-700"
            />

            {{ headerData.title }}

        </h1>


        <p
            class="text-[12px] text-slate-400 font-medium"
        >
            {{ headerData.description }}
        </p>

    </div>



    <button
        v-if="headerData.button"
        @click="handleButtonClick"
        class="bg-[#111111] z-10 hover:bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
    >

        {{ headerData.button }}

    </button>


</div>

</template>