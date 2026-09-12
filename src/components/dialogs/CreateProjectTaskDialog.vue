<script setup lang="ts">

import {
    computed,
    reactive,
    watch,
} from "vue";

import {
    useRoute,
} from "vue-router";

import {
    X,
    ListTodo,
} from "lucide-vue-next";

import {
    TaskStatus,
    TaskPriority,
} from "@/types/task";

import {
    useWorkspaceMemberStore,
} from "@/services/stores/workspace-member.store";

import {
    useWorkspaceStore,
} from "@/services/stores/workspace.store";

import {
    useProjectStore,
} from "@/services/stores/project.store";


// =========================================================
// Stores
// =========================================================

const workspaceMemberStore =
    useWorkspaceMemberStore();

const workspaceStore =
    useWorkspaceStore();

const projectStore =
    useProjectStore();

const route =
    useRoute();


// =========================================================
// Project ID
// =========================================================

const projectId = computed(() => {

    const id =
        Number(route.params.projectId);

    return Number.isFinite(id) && id > 0
        ? id
        : null;

});


// =========================================================
// Dialog
// =========================================================

const open =
    defineModel<boolean>("open");


// =========================================================
// Events
// =========================================================

const emit = defineEmits<{
    created: [
        task: {
            title: string;
            description: string | null;
            status: TaskStatus;
            priority: TaskPriority;
            dueDate: string | null;
            assignedToId: number | null;
        }
    ];
}>();


// =========================================================
// Form
// =========================================================

const form = reactive({

    title: "",

    description: "",

    status:
        TaskStatus.Todo,

    priority:
        TaskPriority.Medium,

    dueDate: "",

    assignedToId:
        null as number | null,

});


// =========================================================
// Validation Errors
// =========================================================

const errors = reactive<{
    title: string | null;
    description: string | null;
    status: string | null;
    priority: string | null;
    dueDate: string | null;
    assignedToId: string | null;
    project: string | null;
}>({

    title: null,

    description: null,

    status: null,

    priority: null,

    dueDate: null,

    assignedToId: null,

    project: null,

});


// =========================================================
// Workspace
// =========================================================

const workspaceId = computed(() => {

    return workspaceStore.currentWorkspace?.id ?? null;

});


// =========================================================
// Current Project
// =========================================================

const currentProject = computed(() => {

    return projectStore.currentProject;

});


// =========================================================
// Project End Date
// =========================================================

const projectEndDate = computed(() => {

    return currentProject.value?.endDate ?? null;

});


// =========================================================
// Maximum Due Date
// =========================================================

const maxDueDate = computed(() => {

    return projectEndDate.value ?? undefined;

});

const minDueDate = computed(() => {

    return currentProject.value?.startDate ?? undefined;

});


// =========================================================
// Project End Date Label
// =========================================================

const projectEndDateLabel = computed(() => {

    if (!projectEndDate.value) {
        return null;
    }

    const date =
        new Date(
            `${projectEndDate.value}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(date);

});


// =========================================================
// Members
// =========================================================

const members = computed(() => {

    return workspaceMemberStore.members.map(
        (member: any) => ({
            id: member.id,

            name:
                member.user?.fullName ??
                "Unknown member",
        })

    );

});


// =========================================================
// Clear Errors
// =========================================================

function clearErrors() {

    errors.title = null;

    errors.description = null;

    errors.status = null;

    errors.priority = null;

    errors.dueDate = null;

    errors.assignedToId = null;

    errors.project = null;

}


// =========================================================
// Validate Form
// =========================================================

function validateForm(): boolean {

    clearErrors();

    let valid = true;


    // -------------------------------------------------------
    // Title
    // -------------------------------------------------------

    const title =
        form.title.trim();

    if (!title) {

        errors.title =
            "Task title is required.";

        valid = false;

    } else if (title.length < 3) {

        errors.title =
            "Task title must be at least 3 characters.";

        valid = false;

    } else if (title.length > 255) {

        errors.title =
            "Task title must not exceed 255 characters.";

        valid = false;

    }


    // -------------------------------------------------------
    // Description
    // -------------------------------------------------------

    if (
        form.description.trim().length > 2000
    ) {

        errors.description =
            "Description must not exceed 2000 characters.";

        valid = false;

    }


    // -------------------------------------------------------
    // Status
    // -------------------------------------------------------

    const validStatuses = Object.values(TaskStatus);

    if (
        !validStatuses.includes(form.status)
    ) {

        errors.status =
            "Please select a valid status.";

        valid = false;

    }


    // -------------------------------------------------------
    // Priority
    // -------------------------------------------------------

    const validPriorities =
        Object.values(TaskPriority);

    if (
        !validPriorities.includes(form.priority)
    ) {

        errors.priority =
            "Please select a valid priority.";

        valid = false;

    }


    // -------------------------------------------------------
    // Project
    // -------------------------------------------------------

    if (!projectId.value) {

        errors.project =
            "Unable to determine the current project.";

        valid = false;

    } else if (!currentProject.value) {

        errors.project =
            "Project information is not available. Please try again.";

        valid = false;

    }


    // -------------------------------------------------------
    // Due Date
    // -------------------------------------------------------

    if (form.dueDate) {

        const dueDate =
            new Date(
                `${form.dueDate}T00:00:00`
            );

        if (
            Number.isNaN(
                dueDate.getTime()
            )
        ) {

            errors.dueDate =
                "Please enter a valid due date.";

            valid = false;

        }


        /*
         * Task cannot be due after project end date.
         */
        if (
            projectEndDate.value &&
            form.dueDate > projectEndDate.value
        ) {

            errors.dueDate =
                `Due date cannot be after the project end date${projectEndDateLabel.value ? ` (${projectEndDateLabel.value})` : ""}.`;

            valid = false;

        }


        /*
         * Optional: don't allow a task due date
         * before the project start date.
         */
        if (
            currentProject.value?.startDate &&
            form.dueDate < currentProject.value.startDate
        ) {

            errors.dueDate =
                "Due date cannot be before the project start date.";

            valid = false;

        }

    }


    // -------------------------------------------------------
    // Assigned To
    // -------------------------------------------------------

    if (form.assignedToId !== null) {

        const assignedMemberExists =
            members.value.some(
                member =>
                    member.id === form.assignedToId
            );

        if (!assignedMemberExists) {

            errors.assignedToId =
                "Selected assignee is not a workspace member.";

            valid = false;

        }

    }


    return valid;

}


// =========================================================
// Load Project
// =========================================================

async function loadProject() {

    const id =
        projectId.value;

    const workspace =
        workspaceStore.currentWorkspace;


    if (
        !id ||
        !workspace
    ) {

        return;

    }


    /*
     * Don't fetch the project again if it is
     * already the current project.
     */
    if (
        projectStore.currentProject?.id === id
    ) {

        return;

    }


    try {

        await projectStore.fetchProject(
            workspace.id,
            id,
        );

    } catch (error) {

        console.error(
            "Failed to load project:",
            error,
        );

        errors.project =
            "Unable to load project information.";

    }

}


// =========================================================
// Load Members
// =========================================================

async function loadMembers() {

    let id =
        workspaceId.value;


    if (!id) {

        try {

            await workspaceStore.fetchMyWorkspaces();

            id =
                workspaceStore.currentWorkspace?.id ?? null;

        } catch (error) {

            console.error(
                "Failed to load workspace:",
                error
            );

            return;

        }

    }


    if (!id) {

        console.warn(
            "No current workspace found. Cannot load members."
        );

        return;

    }


    try {

        await workspaceMemberStore.fetchMembers(
            id
        );

    } catch (error) {

        console.error(
            "Failed to load workspace members:",
            error
        );

    }

}


// =========================================================
// Watch Dialog
// =========================================================

watch(
    open,
    async (isOpen) => {

        if (!isOpen) {
            return;
        }


        clearErrors();


        /*
         * Make sure workspace exists first.
         */
        if (
            !workspaceStore.currentWorkspace
        ) {

            try {

                await workspaceStore.fetchMyWorkspaces();

            } catch (error) {

                console.error(
                    "Failed to initialize workspace:",
                    error,
                );

                errors.project =
                    "Unable to initialize workspace.";

                return;

            }

        }


        await Promise.all([
            loadProject(),
            loadMembers(),
        ]);

    }
);


// =========================================================
// Clear field errors when user starts correcting them
// =========================================================

watch(
    () => form.title,
    () => {

        if (form.title.trim()) {
            errors.title = null;
        }

    }
);


watch(
    () => form.description,
    () => {

        if (
            form.description.trim().length <= 2000
        ) {

            errors.description = null;

        }

    }
);


watch(
    () => form.status,
    () => {

        errors.status = null;

    }
);


watch(
    () => form.priority,
    () => {

        errors.priority = null;

    }
);


watch(
    () => form.dueDate,
    () => {

        /*
         * Let the user see the validation error
         * while editing the date.
         */
        if (!form.dueDate) {

            errors.dueDate = null;

            return;

        }


        if (
            projectEndDate.value &&
            form.dueDate <= projectEndDate.value
        ) {

            if (
                currentProject.value?.startDate &&
                form.dueDate < currentProject.value.startDate
            ) {

                errors.dueDate =
                    "Due date cannot be before the project start date.";

            } else {

                errors.dueDate = null;

            }

        }

    }
);


watch(
    () => form.assignedToId,
    () => {

        errors.assignedToId = null;

    }
);


// =========================================================
// Close
// =========================================================

function close() {

    form.title = "";

    form.description = "";

    form.status =
        TaskStatus.Todo;

    form.priority =
        TaskPriority.Medium;

    form.dueDate = "";

    form.assignedToId =
        null;


    clearErrors();


    open.value = false;

}


// =========================================================
// Create Task
// =========================================================

function createTask() {

    /*
     * Validate everything before emitting.
     */
    if (!validateForm()) {
        return;
    }


    emit(
        "created",
        {

            title:
                form.title.trim(),

            description:
                form.description.trim()
                    ? form.description.trim()
                    : null,

            status:
                form.status,

            priority:
                form.priority,

            dueDate:
                form.dueDate || null,

            assignedToId:
                form.assignedToId,

        }
    );


    close();

}

</script>


<template>

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
            overflow-hidden
            rounded-xl
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
                px-10
                py-6
            ">

                    <div class="
                    flex
                    items-center
                    gap-4
                ">

                        <div class="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-900
                    ">

                            <ListTodo class="h-6 w-6 text-white" />

                        </div>


                        <div>

                            <h2 class="
                            text-lg
                            font-bold
                            text-slate-900
                        ">
                                Create New Task
                            </h2>


                            <p class="
                            mt-1
                            text-sm
                            text-slate-500
                        ">
                                Add a new task to your project.
                            </p>

                        </div>

                    </div>


                    <button type="button" @click="close" class="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    transition
                    hover:bg-slate-100
                ">

                        <X class="h-5 w-5 text-slate-500" />

                    </button>

                </div>



                <!-- Form -->


                <div class="
                space-y-6
                px-10
                py-8
            ">


                    <!-- Task Title -->


                    <div>

                        <label class="
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-600
    ">
                            Task Title
                        </label>

                        <input v-model="form.title" type="text" placeholder="Design social media campaign" :class="[
                            'mt-2 h-12 w-full rounded-lg border bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4 focus:ring-slate-900/5',
                            errors.title
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/5'
                                : 'border-slate-200 focus:border-slate-900'
                        ]" />

                        <p v-if="errors.title" class="mt-1.5 text-xs text-red-500">
                            {{ errors.title }}
                        </p>

                    </div>


                    <!-- Description -->
                    <div>

                        <label class="
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-600
    ">
                            Description
                        </label>

                        <textarea v-model="form.description" rows="4" maxlength="255"
                            placeholder="Describe what needs to be completed..." :class="[
                                'mt-2 w-full resize-none rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4 focus:ring-slate-900/5',
                                errors.description
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/5'
                                    : 'border-slate-200 focus:border-slate-900'
                            ]" />

                        <p v-if="errors.description" class="mt-1.5 text-xs text-red-500">
                            {{ errors.description }}
                        </p>

                    </div>


                    <!-- Status + Priority -->


                    <div class="
                    grid
                    grid-cols-2
                    gap-5
                ">

                        <!-- Status -->

                        <div>

                            <label class="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-600
                        ">
                                Status
                            </label>


                            <select v-model="form.status" :class="[
                                'mt-2 h-12 w-full rounded-lg border bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4',
                                errors.status
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/5'
                                    : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/5'
                            ]">

                                <option :value="TaskStatus.Todo">
                                    To Do
                                </option>


                                <option :value="TaskStatus.InProgress">
                                    In Progress
                                </option>


                                <option :value="TaskStatus.Review">
                                    Review
                                </option>

                            </select>
                            <p v-if="errors.status" class="mt-1.5 text-xs text-red-500">
                                {{ errors.status }}
                            </p>

                        </div>


                        <!-- Priority -->

                        <div>

                            <label class="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-600
                        ">
                                Priority
                            </label>


                            <select v-model="form.priority" :class="[
                                'mt-2 h-12 w-full rounded-lg border bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4',
                                errors.priority
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/5'
                                    : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/5'
                            ]">

                                <option :value="TaskPriority.Low">
                                    Low
                                </option>


                                <option :value="TaskPriority.Medium">
                                    Medium
                                </option>


                                <option :value="TaskPriority.High">
                                    High
                                </option>


                                <option :value="TaskPriority.Critical">
                                    Critical
                                </option>

                            </select>

                            <p v-if="errors.priority" class="mt-1.5 text-xs text-red-500">
                                {{ errors.priority }}
                            </p>

                        </div>

                    </div>


                    <!-- ================================================= -->
                    <!-- Due Date + Assigned To -->
                    <!-- ================================================= -->

                    <div class="
                    grid
                    grid-cols-2
                    gap-5
                ">

                        <!-- Due Date -->

                        <div>

                            <label class="
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-600
    ">
                                Due Date
                            </label>

                            <input v-model="form.dueDate" type="date" :min="minDueDate" :max="maxDueDate" :class="[
                                'mt-2 h-12 w-full rounded-lg border bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4',
                                errors.dueDate
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/5'
                                    : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/5'
                            ]" />

                            <p v-if="errors.dueDate" class="mt-1.5 text-xs text-red-500">
                                {{ errors.dueDate }}
                            </p>

                            <p v-else-if="projectEndDateLabel" class="mt-1.5 text-xs text-slate-500">
                                Due date must be on or before
                                {{ projectEndDateLabel }}.
                            </p>

                            <p v-else-if="currentProject && !projectEndDate" class="mt-1.5 text-xs text-amber-600">
                                This project has no end date.
                            </p>

                        </div>


                        <!-- Assigned To -->

                        <div>

                            <label class="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-600
                        ">
                                Assigned To
                            </label>


                            <select v-model="form.assignedToId" :disabled="workspaceMemberStore.loading" :class="[
                                'mt-2 h-12 w-full rounded-lg border bg-slate-50 px-3 text-sm text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:bg-white focus:ring-4',
                                errors.assignedToId
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/5'
                                    : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/5'
                            ]">

                                <!-- Unassigned -->

                                <option :value="null">
                                    Unassigned
                                </option>


                                <!-- Loading -->

                                <option v-if="workspaceMemberStore.loading" disabled :value="null">
                                    Loading members...
                                </option>


                                <!-- Members -->

                                <option v-for="member in members" :key="member.id" :value="member.id">
                                    {{ member.name }}
                                </option>


                                <!-- Empty -->

                                <option v-if="
                                    !workspaceMemberStore.loading &&
                                    members.length === 0
                                " disabled :value="null">
                                    No workspace members found
                                </option>

                            </select>


                            <!-- Error -->

                            <p v-if="workspaceMemberStore.error" class="
                            mt-1.5
                            text-[11px]
                            text-red-500
                        ">
                                {{ workspaceMemberStore.error }}
                            </p>

                            <p v-if="errors.assignedToId" class="mt-1.5 text-xs text-red-500">
                                {{ errors.assignedToId }}
                            </p>

                        </div>

                    </div>


                    <!-- ================================================= -->
                    <!-- Info -->
                    <!-- ================================================= -->

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
                            New tasks are created with To Do status and Medium priority.
                        </p>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- Footer -->
                <!-- ================================================= -->

                <div class="
                flex
                justify-end
                gap-3
                border-t
                border-slate-100
                bg-slate-50
                px-10
                py-5
            ">

                    <button type="button" @click="close" class="
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
                ">
                        Cancel
                    </button>


                    <button type="button" @click="createTask" class="
                    h-11
                    rounded-lg
                    bg-slate-900
                    px-6
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-black
                ">
                        Create Task
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