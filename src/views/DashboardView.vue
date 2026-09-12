<script setup lang="ts">
import {
    onMounted,
    ref,
    computed,
} from "vue";

import { useAppStore } from "@/services/stores/app.store";
import { useWorkspaceStore } from "@/services/stores/workspace.store";

import SiderBar from "@/components/dashboard/SiderBar.vue";
import HeaderSection from "@/components/dashboard/HeaderSection.vue";

import CreateWorkspaceDialog from "@/components/dialogs/CreateWorkspaceDialog.vue";


/*
|--------------------------------------------------------------------------
| Stores
|--------------------------------------------------------------------------
*/

const appStore = useAppStore();
const workspaceStore = useWorkspaceStore();


/*
|--------------------------------------------------------------------------
| Initialization state
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| workspaceChecking = true
|     -> ONLY the loading screen is rendered
|
| workspaceChecking = false
|     -> application/dashboard can mount
|
|--------------------------------------------------------------------------
*/

const workspaceChecking = ref(true);

const error = ref<string | null>(null);

const showWorkspaceWarning = ref(false);

const createWorkspaceOpen = ref(false);


/*
|--------------------------------------------------------------------------
| Workspace
|--------------------------------------------------------------------------
*/

const hasWorkspace = computed(() => {
    return Boolean(
        workspaceStore.currentWorkspace
    );
});


/*
|--------------------------------------------------------------------------
| Check workspace
|--------------------------------------------------------------------------
*/

async function checkWorkspace() {

    /*
     * Make absolutely sure the application
     * remains hidden while checking.
     */

    workspaceChecking.value = true;

    error.value = null;

    showWorkspaceWarning.value = false;


    try {

        /*
         * This must finish before RouterView
         * is allowed to render.
         */

        await appStore.initializeDashboard();


        /*
         * Workspace check happens AFTER
         * initialization has completed.
         */

        if (!hasWorkspace.value) {

            showWorkspaceWarning.value = true;

        }

    } catch (err: any) {

        console.error(
            "Workspace check failed:",
            err
        );

        error.value =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to check your workspace.";

    } finally {

        /*
         * ONLY NOW can the application render.
         */

        workspaceChecking.value = false;

    }

}


/*
|--------------------------------------------------------------------------
| Initial check
|--------------------------------------------------------------------------
*/

onMounted(() => {
    checkWorkspace();
});


/*
|--------------------------------------------------------------------------
| Workspace actions
|--------------------------------------------------------------------------
*/

function openCreateWorkspace() {

    showWorkspaceWarning.value = false;

    createWorkspaceOpen.value = true;

}


function closeWorkspaceWarning() {

    showWorkspaceWarning.value = false;

}
</script>


<template>

    <main class="h-screen w-screen overflow-hidden bg-[#f3f6f9]">


        <!-- ================================================= -->
        <!-- WORKSPACE CHECKING -->
        <!-- ================================================= -->
        <!--
            NOTHING ELSE IS MOUNTED HERE.

            No Sidebar.
            No Header.
            No RouterView.
            No Dashboard skeleton.

            This remains until initializeDashboard()
            has completely finished.
        -->

        <div
            v-if="workspaceChecking"
            class="flex h-screen w-screen items-center justify-center bg-[#f3f6f9]"
        >

            <div class="flex flex-col items-center">

                <div
                    class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"
                />

                <p
                    class="mt-4 text-sm font-medium text-slate-500"
                >
                    Checking workspace...
                </p>

            </div>

        </div>


        <!-- ================================================= -->
        <!-- ERROR -->
        <!-- ================================================= -->

        <div
            v-else-if="error"
            class="flex h-screen w-screen items-center justify-center bg-[#f3f6f9]"
        >

            <div
                class="w-full max-w-md rounded-2xl border border-rose-100 bg-white p-7 text-center shadow-sm"
            >

                <div
                    class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 font-bold text-rose-500"
                >
                    !
                </div>


                <h2
                    class="mt-4 text-base font-bold text-slate-900"
                >
                    Unable to load dashboard
                </h2>


                <p
                    class="mt-2 text-xs leading-5 text-slate-500"
                >
                    {{ error }}
                </p>


                <button
                    type="button"
                    class="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    @click="checkWorkspace"
                >
                    Try again
                </button>

            </div>

        </div>


        <!-- ================================================= -->
        <!-- APPLICATION -->
        <!-- ================================================= -->

        <template v-else>

            <div class="flex h-screen w-screen overflow-hidden bg-[#f3f6f9]">

                <!-- Sidebar -->

                <SiderBar />


                <!-- Main -->

                <div
                    class="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
                >

                    <HeaderSection />


                    <!--
                        IMPORTANT:

                        RouterView is not mounted until
                        workspaceChecking === false.

                        Therefore Dashboard.vue cannot start
                        loading projects/tasks before the
                        workspace check has finished.
                    -->

                    <RouterView />

                </div>


                <!-- ================================================= -->
                <!-- NO WORKSPACE -->
                <!-- ================================================= -->

                <div
                    v-if="showWorkspaceWarning"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                >

                    <div
                        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >

                        <h2
                            class="text-lg font-bold text-slate-800"
                        >
                            No workspace found
                        </h2>


                        <p
                            class="mt-2 text-sm leading-relaxed text-slate-500"
                        >
                            You don't belong to any workspace yet.
                            Create a workspace to start managing
                            projects and tasks.
                        </p>


                        <div
                            class="mt-6 flex justify-between gap-3"
                        >

                            <button
                                type="button"
                                class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                                @click="closeWorkspaceWarning"
                            >
                                Close
                            </button>


                            <button
                                type="button"
                                class="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                @click="openCreateWorkspace"
                            >
                                Create Workspace
                            </button>

                        </div>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- CREATE WORKSPACE -->
                <!-- ================================================= -->

                <CreateWorkspaceDialog
                    v-model:open="createWorkspaceOpen"
                />

            </div>

        </template>

    </main>

</template>
