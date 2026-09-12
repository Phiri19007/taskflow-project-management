<script setup lang="ts">

import {
    reactive,
    computed,
    watch,
    ref,
} from "vue";

import { useRouter } from "vue-router";

import {
    X,
    FolderKanban,
    Trash2,
    AlertTriangle,
} from "lucide-vue-next";

import type { Project } from "@/types/project";
import { ProjectStatus } from "@/types/project";

import {
    useProjectStore,
} from "@/services/stores/project.store";

import {
    useWorkspaceStore,
} from "@/services/stores/workspace.store";

import { useToastStore } from "@/services/stores/toast.store";



// =========================================================
// Dialog
// =========================================================

const open =
    defineModel<boolean>("open");


// =========================================================
// Props
// =========================================================

const props = defineProps<{
    project: Project | null;
}>();

const router =
    useRouter();

// =========================================================
// Store
// =========================================================

const projectStore =
    useProjectStore();

const toast =
    useToastStore();

const workspaceStore =
    useWorkspaceStore();

const workspaceId = computed(() => {

    return (
        workspaceStore.currentWorkspace?.id ??
        null
    );

});


// =========================================================
// Events
// =========================================================

const emit = defineEmits<{
    updated: [
        project: {
            id: number;
            name: string;
            description: string | null;
            status: ProjectStatus;
            startDate: string | null;
            endDate: string | null;
        }
    ];

    deleted: [
        projectId: number
    ];
}>();


// =========================================================
// Delete Confirmation
// =========================================================

const showDeleteConfirmation =
    ref(false);

const deleting =
    ref(false);


// =========================================================
// Form
// =========================================================

const form = reactive({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: ProjectStatus.ACTIVE,
});


// =========================================================
// Has Changes
// =========================================================

const hasChanges = computed(() => {

    if (!props.project) {
        return false;
    }

    return (

        form.name.trim() !==
        props.project.name.trim()

        ||

        form.description.trim() !==
        (props.project.description ?? "").trim()

        ||

        form.startDate !==
        (props.project.startDate ?? "")

        ||

        form.endDate !==
        (props.project.endDate ?? "")

        ||

        form.status !==
        props.project.status

    );

});


// =========================================================
// Can Delete
// =========================================================

const canDeleteProject = computed(() => {

    return (
        !!props.project &&
        !deleting.value
    );

});


// =========================================================
// Populate Form
// =========================================================

watch(
    [() => props.project, open],
    ([project, isOpen]) => {

        if (!project || !isOpen) {
            return;
        }

        form.name =
            project.name;

        form.description =
            project.description ?? "";

        form.startDate =
            project.startDate ?? "";

        form.endDate =
            project.endDate ?? "";

        form.status =
            project.status;

    },
    {
        immediate: true
    }
);


// =========================================================
// Close
// =========================================================

function close() {

    if (deleting.value) {
        return;
    }

    showDeleteConfirmation.value =
        false;

    form.name = "";
    form.description = "";
    form.startDate = "";
    form.endDate = "";
    form.status =
        ProjectStatus.ACTIVE;

    open.value = false;
}


// =========================================================
// Update Project
// =========================================================

function updateProject() {

    if (!props.project) {
        return;
    }

    if (!form.name.trim()) {
        return;
    }

    if (!hasChanges.value) {
        return;
    }

    emit(
        "updated",
        {
            id:
                props.project.id,

            name:
                form.name.trim(),

            description:
                form.description.trim()
                    ? form.description.trim()
                    : null,

            status:
                form.status,

            startDate:
                form.startDate || null,

            endDate:
                form.endDate || null,
        }
    );

    close();
}


// =========================================================
// Request Delete
// =========================================================

function requestDeleteProject() {

    if (
        !props.project ||
        !canDeleteProject.value
    ) {
        return;
    }

    showDeleteConfirmation.value =
        true;
}


// =========================================================
// Cancel Delete
// =========================================================

function cancelDeleteProject() {

    if (deleting.value) {
        return;
    }

    showDeleteConfirmation.value =
        false;
}


// =========================================================
// Confirm Delete
// =========================================================

async function confirmDeleteProject() {

    if (
        !props.project ||
        deleting.value
    ) {
        return;
    }

    const projectId =
        props.project.id;

    deleting.value =
        true;

    try {

        const id = workspaceId.value;

        if (!id) {
            console.error(
                "Unable to delete project: workspace ID is missing."
            );

            return;
        }

        await projectStore.deleteProject(
            id,
            projectId
        )


        showDeleteConfirmation.value =
            false;

        emit(
            "deleted",
            projectId
        );

        close();


        await router.push({
            name: "active-project",
        })

        toast.success(
            "Project deleted successfully"
        );

    } catch (error) {

        console.error(
            "Failed to delete project:",
            error
        );

        toast.error(
            "Failed to delete project. Please try again."
        );
        /*
         * Keep the confirmation dialog open if
         * deletion fails so the user can retry.
         */

    } finally {

        deleting.value =
            false;

    }
}

</script>


<template>

    <!-- ========================================================= -->
    <!-- Update Project Dialog -->
    <!-- ========================================================= -->

    <Transition name="fade">

        <div v-if="open" class="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/40
        backdrop-blur-sm
        p-6
    ">

            <div class="
            w-full
            max-w-4xl
            bg-white
            rounded-xl
            border
            border-slate-200
            shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
            overflow-hidden
        ">

                <!-- ================================================= -->
                <!-- Header -->
                <!-- ================================================= -->

                <div class="
                flex
                items-center
                justify-between
                px-10
                py-6
                border-b
                border-slate-100
            ">

                    <div class="flex items-center gap-4">

                        <div class="
                        h-12
                        w-12
                        rounded-xl
                        bg-slate-900
                        flex
                        items-center
                        justify-center
                    ">

                            <FolderKanban class="w-6 h-6 text-white" />

                        </div>


                        <div>

                            <h2 class="
                            text-lg
                            font-bold
                            text-slate-900
                        ">
                                Update Project
                            </h2>


                            <p class="
                            text-sm
                            text-slate-500
                            mt-1
                        ">
                                Update the details of your project.
                            </p>

                        </div>

                    </div>


                    <button type="button" @click="close" :disabled="deleting" class="
                    h-9
                    w-9
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    hover:bg-slate-100
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                ">

                        <X class="w-5 h-5 text-slate-500" />

                    </button>

                </div>


                <!-- ================================================= -->
                <!-- Form -->
                <!-- ================================================= -->

                <div class="
                px-10
                py-8
                space-y-6
            ">

                    <!-- Project Name -->

                    <div>

                        <label class="
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wide
                    ">
                            Project Name
                        </label>


                        <input v-model="form.name" type="text" placeholder="Website redesign" class="
                        mt-2
                        w-full
                        h-12
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        text-sm
                        text-slate-800
                        outline-none
                        transition
                        focus:border-slate-900
                        focus:bg-white
                        focus:ring-4
                        focus:ring-slate-900/5
                    " />

                    </div>


                    <!-- Description -->

                    <div>

                        <label class="
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wide
                    ">
                            Description
                        </label>


                        <textarea v-model="form.description" rows="5" placeholder="Describe the project goals..." class="
                        mt-2
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3
                        text-sm
                        resize-none
                        outline-none
                        transition
                        focus:border-slate-900
                        focus:bg-white
                        focus:ring-4
                        focus:ring-slate-900/5
                    "></textarea>

                    </div>


                    <!-- Dates -->

                    <div class="
                    grid
                    grid-cols-2
                    gap-5
                ">

                        <div>

                            <label class="
                            text-xs
                            font-semibold
                            text-slate-600
                            uppercase
                            tracking-wide
                        ">
                                Start Date
                            </label>


                            <input v-model="form.startDate" type="date" class="
                            mt-2
                            w-full
                            h-12
                            rounded-lg
                            border
                            border-slate-200
                            bg-slate-50
                            px-3
                            text-sm
                            outline-none
                            focus:border-slate-900
                        " />

                        </div>


                        <div>

                            <label class="
                            text-xs
                            font-semibold
                            text-slate-600
                            uppercase
                            tracking-wide
                        ">
                                End Date
                            </label>


                            <input v-model="form.endDate" type="date" class="
                            mt-2
                            w-full
                            h-12
                            rounded-lg
                            border
                            border-slate-200
                            bg-slate-50
                            px-3
                            text-sm
                            outline-none
                            focus:border-slate-900
                        " />

                        </div>

                    </div>


                    <!-- Status -->

                    <div>

                        <label class="
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wide
                    ">
                            Status
                        </label>


                        <select v-model="form.status" class="
                        mt-2
                        w-full
                        h-12
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        text-sm
                        text-slate-800
                        outline-none
                        transition
                        focus:border-slate-900
                        focus:bg-white
                        focus:ring-4
                        focus:ring-slate-900/5
                    ">

                            <option :value="ProjectStatus.ACTIVE">
                                Active
                            </option>

                            <option :value="ProjectStatus.PLANNING">
                                Planning
                            </option>

                            <option :value="ProjectStatus.ON_HOLD">
                                On Hold
                            </option>

                            <option :value="ProjectStatus.COMPLETED">
                                Completed
                            </option>

                            <option :value="ProjectStatus.ARCHIVED">
                                Archived
                            </option>

                        </select>

                    </div>


                    <!-- Info -->

                    <div class="
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-blue-100
                    bg-blue-50
                    px-4
                    py-3
                ">

                        <div class="
                        h-2
                        w-2
                        rounded-full
                        bg-blue-600
                    "></div>


                        <p class="
                        text-sm
                        text-blue-700
                    ">
                            Changes will be applied to this project.
                        </p>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- Footer -->
                <!-- ================================================= -->

                <div class="
                flex
                items-center
                justify-between
                gap-3
                px-10
                py-5
                border-t
                border-slate-100
                bg-slate-50
            ">

                    <!-- Delete -->

                    <button v-if="canDeleteProject" type="button" @click="requestDeleteProject" :disabled="deleting"
                        class="
                    flex
                    h-11
                    items-center
                    gap-2
                    rounded-lg
                    px-4
                    text-sm
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                    hover:text-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                ">

                        <Trash2 class="h-4 w-4" />

                        <span>
                            Delete Project
                        </span>

                    </button>


                    <div v-else class="flex-1" />


                    <!-- Normal Actions -->

                    <div class="
                    flex
                    items-center
                    gap-3
                ">

                        <button type="button" @click="close" :disabled="deleting" class="
                        h-11
                        px-5
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-sm
                        font-medium
                        text-slate-600
                        hover:bg-slate-100
                        transition
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    ">
                            Cancel
                        </button>


                        <button type="button" @click="updateProject" :disabled="!form.name.trim() ||
                            !hasChanges ||
                            deleting
                            " :class="[
                                'h-11 px-6 rounded-lg text-white text-sm font-semibold transition shadow-sm',

                                form.name.trim() &&
                                    hasChanges &&
                                    !deleting
                                    ? 'bg-slate-900 hover:bg-black'
                                    : 'bg-slate-300 cursor-not-allowed'
                            ]">
                            Update Project
                        </button>

                    </div>

                </div>

            </div>

        </div>

    </Transition>


    <!-- ========================================================= -->
    <!-- Delete Confirmation Dialog -->
    <!-- ========================================================= -->

    <Transition name="fade">

        <div v-if="showDeleteConfirmation" class="
        fixed
        inset-0
        z-60
        flex
        items-center
        justify-center
        bg-slate-950/40
        p-6
        backdrop-blur-sm
    " @click.self="cancelDeleteProject">

            <div class="
            w-full
            max-w-2xl
            overflow-hidden
            rounded-lg
            border
            border-slate-200
            bg-white
            shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
        ">

                <!-- ================================================= -->
                <!-- Header -->
                <!-- ================================================= -->

                <div class="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-8
                py-5
            ">

                    <div class="
                    flex
                    items-center
                    gap-4
                ">

                        <div class="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-red-50
                    ">

                            <AlertTriangle class="
                            h-5
                            w-5
                            text-red-600
                        " />

                        </div>


                        <div>

                            <h2 class="
                            text-lg
                            font-bold
                            text-slate-900
                        ">
                                Delete Project
                            </h2>

                            <p class="
                            mt-0.5
                            text-sm
                            text-slate-500
                        ">
                                This action cannot be undone.
                            </p>

                        </div>

                    </div>


                    <button type="button" @click="cancelDeleteProject" :disabled="deleting" class="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    transition
                    hover:bg-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                ">

                        <X class="
                        h-5
                        w-5
                        text-slate-500
                    " />

                    </button>

                </div>


                <!-- ================================================= -->
                <!-- Content -->
                <!-- ================================================= -->

                <div class="
                px-8
                py-6
            ">

                    <p class="
                    text-sm
                    leading-6
                    text-slate-600
                ">
                        Are you sure you want to delete this project?
                    </p>


                    <!-- Project Preview -->

                    <div v-if="props.project" class="
                    mt-4
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-5
                    py-4
                ">

                        <p class="
                        truncate
                        text-sm
                        font-semibold
                        text-slate-900
                    ">
                            {{ props.project.name }}
                        </p>

                        <p class="
                        mt-1
                        text-xs
                        text-slate-500
                    ">
                            This project and its associated data will be
                            permanently removed.
                        </p>

                    </div>


                    <!-- Warning -->

                    <div class="
                    mt-4
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-red-100
                    bg-red-50
                    px-5
                    py-3.5
                ">

                        <AlertTriangle class="
                        h-4
                        w-4
                        shrink-0
                        text-red-600
                    " />

                        <p class="
                        text-xs
                        leading-5
                        text-red-700
                    ">
                            Deleting this project is permanent and
                            cannot be reversed.
                        </p>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- Footer -->
                <!-- ================================================= -->

                <div class="
                flex
                items-center
                justify-end
                gap-3
                border-t
                border-slate-100
                bg-slate-50
                px-8
                py-5
            ">

                    <button type="button" @click="cancelDeleteProject" :disabled="deleting" class="
                    h-11
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-5
                    text-sm
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                ">
                        Cancel
                    </button>


                    <button type="button" @click="confirmDeleteProject" :disabled="deleting" class="
                    flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-red-600
                    px-6
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                ">

                        <Trash2 v-if="!deleting" class="h-4 w-4" />

                        <span>
                            {{ deleting
                                ? "Deleting..."
                                : "Delete Project"
                            }}
                        </span>

                    </button>

                </div>

            </div>

        </div>

    </Transition>

</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
