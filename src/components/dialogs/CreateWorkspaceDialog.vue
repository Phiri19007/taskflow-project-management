<script setup lang="ts">

import { ref } from "vue";

import { X, Building2 } from "lucide-vue-next";

import { workspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/services/stores/workspace.store";
import {useToastStore} from "@/services/stores/toast.store";


const open = defineModel<boolean>("open");


const workspaceName = ref("");
const loading = ref(false);
const error = ref<string | null>(null);


const workspaceStore = useWorkspaceStore();
const toastStore = useToastStore();



function close() {

    workspaceName.value = "";
    error.value = null;
    open.value = false;

}



async function createWorkspace() {


    if (!workspaceName.value.trim()) {

        error.value = "Workspace name is required";
        return;

    }


    try {

        loading.value = true;
        error.value = null;


        await workspaceService.create({
            name: workspaceName.value.trim()
        });

        toastStore.success("Workspace created successfully");

        /*
         * Refresh workspace list
         */
        await workspaceStore.fetchMyWorkspaces();



        /*
         * Select the newly created workspace
         */
        if (workspaceStore.workspaces.length > 0) {

            const lastWorkspace =
                workspaceStore.workspaces.at(-1);

            if (lastWorkspace) {

                workspaceStore.setCurrentWorkspace(
                    lastWorkspace
                );

            }


        }



        close();


    } catch (err: any) {

        console.error(
            "Workspace creation failed",
            err
        );


        error.value =
            err.response?.data?.message ||
            "Failed to create workspace";

        toastStore.error("Failed to create workspace");

    } finally {

        loading.value = false;

    }

}

</script>

<template>

    <Transition name="fade">

        <div v-if="open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-6">

            <Transition name="scale">

                <div v-if="open" class="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-2xl">

                    <!-- Header -->

                    <div class="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">

                        <div class="flex items-center gap-3">

                            <div class="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Building2 class="w-5 h-5 text-slate-600" />
                            </div>

                            <div>

                                <h2 class="text-[17px] font-bold text-slate-800">
                                    Create Workspace
                                </h2>

                                <p class="text-xs text-slate-400 mt-0.5">
                                    Create a new workspace for your team.
                                </p>

                            </div>

                        </div>

                        <button @click="close"
                            class="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">
                            <X class="w-4 h-4 text-slate-500" />
                        </button>

                    </div>

                    <!-- Body -->

                    <div class="px-7 py-6 space-y-5">

                        <div>

                            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Workspace Name
                            </label>

                            <input v-model="workspaceName" type="text" placeholder="e.g. Marketing Team"
                                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-800 focus:bg-white transition" />
                            <p v-if="error" class="text-sm text-red-500 mt-2">
                                {{ error }}
                            </p>

                        </div>

                    </div>

                    <!-- Footer -->

                    <div class="flex justify-between gap-3 px-7 pb-7">

                        <button @click="close"
                            class="px-5 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                            Cancel
                        </button>

                        <button @click="createWorkspace" :disabled="loading"
                            class="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-black transition disabled:opacity-50">
                            {{ loading ? "Creating..." : "Create Workspace" }}
                        </button>

                    </div>

                </div>

            </Transition>

        </div>

    </Transition>

</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
    transition: all .25s ease;
}

.scale-enter-from,
.scale-leave-to {
    opacity: 0;
    transform: scale(.95);
}
</style>