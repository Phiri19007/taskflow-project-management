<script setup lang="ts">

import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useProjectStore } from "@/services/stores/project.store";
import { useWorkspaceStore } from "@/services/stores/workspace.store";
import { useAppStore } from "@/services/stores/app.store";
import { useAuthStore } from "@/services/stores/auth.store";
import type { UpdateProject } from "@/types/project";
import UpdateProjectDialog from "@/components/dialogs/UpdateProjectDialog.vue";
import { useToastStore } from "@/services/stores/toast.store";



const route = useRoute();


const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const appStore = useAppStore();
const authStore = useAuthStore();
const toast = useToastStore();


const project = computed(() =>
    projectStore.currentProject
);

const canUpdateProject = computed(() => {
    return project.value?.createdBy.id === authStore.user?.id;
});

const updateDialogOpen = ref(false);

function openUpdateDialog() {
    updateDialogOpen.value = true;
}

async function handleProjectUpdated(project: UpdateProject) {
    const workspace =
        workspaceStore.currentWorkspace;

    if (!workspace) {
        console.error("No current workspace");
        return;
    }

    try {

        await projectStore.updateProject(
            workspace.id,
            project.id,
            {
                name: project.name,
                description: project.description,
                status: project.status,
                startDate: project.startDate,
                endDate: project.endDate,
            }
        );

      
        toast.success("Project updated successfully");

    } catch (error) {

        toast.error(
            "Failed to update project"
        );

    }

}

onMounted(async () => {

    const projectId = Number(
        route.params.projectId
    );


    /*
     * If page was refreshed,
     * workspace will be empty.
     * Load dashboard data first.
     */
    if (!workspaceStore.currentWorkspace) {

        await appStore.initializeWorkspace();

    }



    const workspace =
        workspaceStore.currentWorkspace;



    if (!workspace) {

        console.error(
            "Workspace not found"
        );

        return;

    }



    await projectStore.fetchProject(
        workspace.id,
        projectId
    );

});







</script>


<template>

    <div v-if="project" class="min-h-full bg-white">

        <div class="mx-auto max-w-7xl px-6 lg:px-8">

            <!-- Back to Active Projects -->

            <div class="pt-5">

                <RouterLink to="/dashboard/projects/active" class="inline-flex
                       items-center
                       gap-1.5
                       text-xs
                       font-medium
                       text-slate-400
                       transition-colors
                       hover:text-slate-700">

                    <!-- Arrow -->
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                        <path fill-rule="evenodd"
                            d="M17 10a.75.75 0 0 1-.75.75H5.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 1 1 1.06 1.06l-3.22 3.22h10.69A.75.75 0 0 1 17 10Z"
                            clip-rule="evenodd" />
                    </svg>

                    <span>
                        Back to active projects
                    </span>

                </RouterLink>

            </div>



            <!-- Project Header -->


            <header class="pt-5">

                <div class="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-start
            sm:justify-between
        ">

                    <!-- Project Information -->
                    <div class="min-w-0">

                        <div class="flex items-center gap-3">

                            <h1 class="
                        truncate
                        text-xl
                        font-semibold
                        tracking-tight
                        text-slate-900
                    ">
                                {{ project.name }}
                            </h1>

                            <span class="
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-md
                        bg-blue-50
                        px-2
                        py-1
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-blue-600
                    ">
                                <span class="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-blue-500
                        "></span>

                                {{ project.status }}
                            </span>

                        </div>


                        <p v-if="project.description" class="
                    mt-1.5
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                ">
                            {{ project.description }}
                        </p>

                    </div>


                    <!-- Update Project -->
                    <button v-if="canUpdateProject" type="button" class="
                inline-flex
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
                hover:bg-slate-800
            " @click="openUpdateDialog()">
                        Update Project
                    </button>

                </div>


                <!-- Project Navigation -->
                <nav class="
            mt-6
            flex
            items-center
            gap-7
            border-b
            border-slate-100
        ">

                    <RouterLink :to="`/project/${project.id}`" class="
                flex
                h-10
                items-center
                text-sm
                font-medium
                transition-colors
            " :class="$route.path === `/project/${project.id}`
                ? 'border-b-2 border-slate-900 text-slate-900 -mb-px'
                : 'text-slate-400 hover:text-slate-700'
                ">
                        Overview
                    </RouterLink>


                    <RouterLink :to="`/project/${project.id}/board`" class="
                flex
                h-10
                items-center
                text-sm
                font-medium
                transition-colors
            " :class="$route.path === `/project/${project.id}/board`
                ? 'border-b-2 border-slate-900 text-slate-900 -mb-px'
                : 'text-slate-400 hover:text-slate-700'
                ">
                        Board
                    </RouterLink>


                    <RouterLink :to="`/project/${project.id}/tasks`" class="
                flex
                h-10
                items-center
                text-sm
                font-medium
                transition-colors
            " :class="$route.path === `/project/${project.id}/tasks`
                ? 'border-b-2 border-slate-900 text-slate-900 -mb-px'
                : 'text-slate-400 hover:text-slate-700'
                ">
                        Tasks
                    </RouterLink>


                    <RouterLink :to="`/project/${project.id}/calendar`" class="
                flex
                h-10
                items-center
                text-sm
                font-medium
                transition-colors
            " :class="$route.path === `/project/${project.id}/calendar`
                ? 'border-b-2 border-slate-900 text-slate-900 -mb-px'
                : 'text-slate-400 hover:text-slate-700'
                ">
                        Calendar
                    </RouterLink>

                </nav>

            </header>



            <!-- Child Page -->


            <RouterView />
            <UpdateProjectDialog v-model:open="updateDialogOpen" :project="project" @updated="handleProjectUpdated"  />

        </div>

    </div>


    <!-- Loading -->

    <div v-else class="flex
           min-h-100
           items-center
           justify-center
           text-sm
           text-slate-400">
        Loading project...
    </div>

</template>