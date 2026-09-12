<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

import ProjectHeader from "@/components/dashboard/views/sectionsHeaders/ProjectHeader.vue";
import { useProjectStore } from "@/services/stores/project.store";

import { PauseCircle } from "lucide-vue-next";

const projectStore = useProjectStore();

const onHoldProjects = computed(() => {
    return projectStore.projects.filter(
        project => project.status === "ON_HOLD"
    );
});
</script>

<template>
    <main
        class="
            min-h-full
            flex-1
            overflow-y-auto
            bg-[#f4f7fa]
        "
    >
        <div
            class="
                mx-auto
                w-full
                max-w-375
                px-4
                py-4
                sm:px-5
                lg:px-6
            "
        >
            <!-- Header -->

            <ProjectHeader
                project="Project On Hold"
            />


            <!-- On Hold Projects -->

            <div
                v-if="onHoldProjects.length"
                class="
                    mt-4
                    grid
                    grid-cols-1
                    gap-5
                    md:grid-cols-2
                    xl:grid-cols-3
                "
            >
                <RouterLink
                    v-for="project in onHoldProjects"
                    :key="project.id"
                    :to="{
                        name: 'project-home',
                        params: {
                            projectId: project.id
                        }
                    }"
                    class="
                        flex
                        h-48
                        cursor-pointer
                        flex-col
                        justify-between
                        rounded-2xl
                        border
                        border-slate-100
                        bg-white
                        p-5
                        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]
                        transition-all
                        duration-200
                        hover:-translate-y-1
                        hover:border-blue-200
                        hover:shadow-lg
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                    "
                >
                    <div>
                        <div
                            class="
                                mb-3
                                flex
                                items-start
                                justify-between
                            "
                        >
                            <span
                                class="
                                    rounded-md
                                    bg-blue-50
                                    px-2
                                    py-0.5
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-blue-600
                                "
                            >
                                {{ project.status }}
                            </span>

                            <span
                                class="
                                    h-2
                                    w-2
                                    rounded-full
                                    bg-blue-600
                                "
                            />
                        </div>

                        <h3
                            class="
                                text-[15px]
                                font-bold
                                text-slate-800
                            "
                        >
                            {{ project.name }}
                        </h3>

                        <p
                            v-if="project.description"
                            class="
                                mt-1
                                line-clamp-3
                                text-[12px]
                                text-slate-400
                            "
                        >
                            {{ project.description }}
                        </p>

                        <p
                            v-else
                            class="
                                mt-1
                                text-[12px]
                                italic
                                text-slate-400
                            "
                        >
                            No description provided.
                        </p>
                    </div>
                </RouterLink>
            </div>


            <!-- Empty State -->

            <div
                v-else
                class="
                    flex
                     min-h-[60vh]
                    flex-col
                    items-center
                    justify-center
                    text-center
                "
            >
                <div
                    class="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        bg-red-50
                    "
                >
                    <PauseCircle
                        class="
                            h-7
                            w-7
                            text-red-500
                        "
                    />
                </div>

                <h3
                    class="
                        mt-6
                        text-2xl
                        font-bold
                        tracking-tight
                        text-slate-900
                    "
                >
                    No projects on hold
                </h3>

                <p
                    class="
                        mt-3
                        max-w-md
                        text-sm
                        leading-6
                        text-slate-500
                    "
                >
                    There are currently no paused projects in this
                    workspace. Projects placed on hold will appear
                    here until they are resumed.
                </p>
            </div>
        </div>
    </main>
</template>
