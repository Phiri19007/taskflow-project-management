<script setup lang="ts">

import {
    computed,
    reactive,
    ref,
    watch,
} from "vue";

import {
    X,
    ListTodo,
    Trash2,
    AlertTriangle,
} from "lucide-vue-next";

import {
    TaskStatus,
    TaskPriority,
    type Task,
} from "@/types/task";

import {
    useTaskStore,
} from "@/services/stores/task.store";

import {
    useWorkspaceMemberStore,
} from "@/services/stores/workspace-member.store";

import {
    useWorkspaceStore,
} from "@/services/stores/workspace.store";

import {
    useProjectStore,
} from "@/services/stores/project.store";

import {
    useToastStore,
} from "@/services/stores/toast.store";

import {
    useRoute,
} from "vue-router";


// =========================================================
// Props
// =========================================================

const props = withDefaults(
    defineProps<{
        task: Task | null;
        role?: "owner" | "assignee";
    }>(),
    {
        task: null,
        role: "assignee",
    }
);


// =========================================================
// Stores
// =========================================================

const taskStore =
    useTaskStore();

const toast =
    useToastStore();

const workspaceMemberStore =
    useWorkspaceMemberStore();

const workspaceStore =
    useWorkspaceStore();

const projectStore =
    useProjectStore();

const route =
    useRoute();


// =========================================================
// Dialog
// =========================================================

const open =
    defineModel<boolean>("open");


// =========================================================
// Events
// =========================================================

const emit = defineEmits<{
    updated: [
        task: Task
    ];
    deleted: [
        taskId: number
    ];
}>();


// =========================================================
// Permissions
// =========================================================

const canAssign = computed(() => {

    return props.role === "owner";

});


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

const initializing = ref(false);

// =========================================================
// Initial Form
// =========================================================

const initialForm = {

    title: "",

    description: "",

    status: TaskStatus.Todo,

    priority: TaskPriority.Medium,

    dueDate: "",

    assignedToId: null as number | null,

};


// =========================================================
// Form
// =========================================================

const form = reactive({

    ...initialForm,

});


// =========================================================
// Original Task
// =========================================================

const originalTaskId =
    ref<number | null>(null);


// =========================================================
// Errors
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
// Loading
// =========================================================

const saving = ref(false);

const deleting = ref(false);

const showDeleteConfirmation = ref(false);

// =========================================================
// Workspace
// =========================================================

const workspaceId = computed(() => {

    return (
        workspaceStore.currentWorkspace?.id ??
        null
    );

});


// =========================================================
// Current Project
// =========================================================

const currentProject = computed(() => {

    return projectStore.currentProject;

});


// =========================================================
// Project Dates
// =========================================================

const projectEndDate = computed(() => {

    return (
        currentProject.value?.endDate ??
        null
    );

});

const minDueDate = computed(() => {

    return (
        currentProject.value?.startDate ??
        undefined
    );

});

const maxDueDate = computed(() => {

    return (
        projectEndDate.value ??
        undefined
    );

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
                member.user?.name ??
                member.name ??
                "Unknown member",
        })
    );

});


// =========================================================
// Populate Form From Task
// =========================================================

function populateForm(
    task: Task,
) {

    originalTaskId.value =
        task.id;

    form.title =
        task.title ?? "";

    form.description =
        task.description ?? "";

    form.status =
        task.status ?? TaskStatus.Todo;

    form.priority =
        task.priority ?? TaskPriority.Medium;

    /*
     * Important:
     *
     * If the API returns:
     *
     * 2026-08-21T00:00:00.000Z
     *
     * the HTML date input needs:
     *
     * 2026-08-21
     */
    form.dueDate =
        task.dueDate
            ? task.dueDate.slice(0, 10)
            : "";

    form.assignedToId =
        task.assignedTo?.id ?? null;

}


// =========================================================
// Reset Form
// =========================================================

function resetForm() {

    originalTaskId.value =
        null;

    Object.assign(
        form,
        initialForm
    );

    clearErrors();

}


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
// Has Changes
// =========================================================

const hasChanges = computed(() => {

    if (!props.task) {
        return false;
    }

    return (

        form.title.trim() !==
            (props.task.title ?? "").trim()

        ||

        form.description.trim() !==
            (props.task.description ?? "").trim()

        ||

        form.status !==
            props.task.status

        ||

        form.priority !==
            props.task.priority

        ||

        form.dueDate !==
            (
                props.task.dueDate
                    ? props.task.dueDate.slice(0, 10)
                    : ""
            )

        ||

        form.assignedToId !==
            (props.task.assignedTo?.id ?? null)

    );

});


// =========================================================
// Can Update
// =========================================================

const canUpdateTask = computed(() => {

    if (!props.task) {
        return false;
    }

    if (saving.value) {
        return false;
    }

    if (!hasChanges.value) {
        return false;
    }

    if (
        form.title.trim().length < 3
    ) {
        return false;
    }

    if (
        form.title.trim().length > 255
    ) {
        return false;
    }

    if (
        form.description.trim().length > 2000
    ) {
        return false;
    }

    if (
        errors.title ||
        errors.description ||
        errors.status ||
        errors.priority ||
        errors.dueDate ||
        errors.assignedToId ||
        errors.project
    ) {
        return false;
    }

    return true;

});


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

    if (
        projectStore.currentProject?.id === id
    ) {
        return;
    }

    try {

        await projectStore.fetchProject(
            workspace.id,
            id
        );

    } catch (error) {

        console.error(
            "Failed to load project:",
            error
        );

        errors.project =
            "Unable to load project information.";

    }

}

const canDeleteTask = computed(() => {

    return (
        !saving.value &&
        !deleting.value &&
        !!props.task
    );

});


// =========================================================
// Load Members
// =========================================================

async function loadMembers() {

    if (!canAssign.value) {
        return;
    }

    let id =
        workspaceId.value;

    if (!id) {

        try {

            await workspaceStore.fetchMyWorkspaces();

            id =
                workspaceStore.currentWorkspace?.id ??
                null;

        } catch (error) {

            console.error(
                "Failed to initialize workspace:",
                error
            );

            return;

        }

    }

    if (!id) {
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

    } else if (
        title.length < 3
    ) {

        errors.title =
            "Task title must be at least 3 characters.";

        valid = false;

    } else if (
        title.length > 255
    ) {

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

    if (
        !Object.values(TaskStatus).includes(
            form.status
        )
    ) {

        errors.status =
            "Please select a valid status.";

        valid = false;

    }


    // -------------------------------------------------------
    // Priority
    // -------------------------------------------------------

    if (
        !Object.values(TaskPriority).includes(
            form.priority
        )
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
            "Project information is not available.";

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

        if (
            projectEndDate.value &&
            form.dueDate >
                projectEndDate.value
        ) {

            errors.dueDate =
                `Due date cannot be after the project end date${
                    projectEndDateLabel.value
                        ? ` (${projectEndDateLabel.value})`
                        : ""
                }.`;

            valid = false;

        }

        if (
            currentProject.value?.startDate &&
            form.dueDate <
                currentProject.value.startDate
        ) {

            errors.dueDate =
                "Due date cannot be before the project start date.";

            valid = false;

        }

    }


    // -------------------------------------------------------
    // Assignment
    // -------------------------------------------------------

    if (!canAssign.value) {

        /*
         * Assignees cannot change the assignment.
         */
        form.assignedToId =
            props.task?.assignedTo?.id ??
            null;

    } else if (
        form.assignedToId !== null
    ) {

        const exists =
            members.value.some(
                member =>
                    member.id ===
                    form.assignedToId
            );

        if (!exists) {

            errors.assignedToId =
                "Selected assignee is not a workspace member.";

            valid = false;

        }

    }


    return valid;

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

        initializing.value = true;

        clearErrors();

        if (props.task) {
            populateForm(props.task);
        } else {
            resetForm();
        }

        if (!workspaceStore.currentWorkspace) {
            try {
                await workspaceStore.fetchMyWorkspaces();
            } catch (error) {
                console.error(
                    "Failed to initialize workspace:",
                    error
                );

                errors.project =
                    "Unable to initialize workspace.";

                initializing.value = false;
                return;
            }
        }

        await loadProject();

        if (canAssign.value) {
            await loadMembers();
        }

        initializing.value = false;
    }
);


// =========================================================
// Watch Task
// =========================================================

watch(
    () => props.task,
    (task) => {

        /*
         * This handles the case where:
         *
         * 1. Dialog is already mounted
         * 2. User clicks another task
         * 3. task prop changes
         */
        if (
            open.value &&
            task
        ) {

            populateForm(task);

            clearErrors();

        }

    }
);


// =========================================================
// Watch Role
// =========================================================

watch(
    () => props.role,
    async (role) => {

        if (
            role !== "owner"
        ) {

            /*
             * Don't allow assignees to
             * modify task assignment.
             */
            form.assignedToId =
                props.task?.assignedTo?.id ??
                null;

            errors.assignedToId =
                null;

        } else if (open.value) {

            await loadMembers();

        }

    }
);


// =========================================================
// Field Watches
// =========================================================

watch(
    () => form.title,
    () => {

        if (
            form.title.trim().length >= 3 &&
            form.title.trim().length <= 255
        ) {

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
        if (initializing.value) {
            return;
        }

        if (!form.dueDate) {
            errors.dueDate = null;
            return;
        }

        const date =
            new Date(
                `${form.dueDate}T00:00:00`
            );

        if (Number.isNaN(date.getTime())) {
            errors.dueDate =
                "Please enter a valid due date.";
            return;
        }

        if (
            projectEndDate.value &&
            form.dueDate >
                projectEndDate.value
        ) {
            errors.dueDate =
                "Due date cannot be after the project end date.";
            return;
        }

        if (
            currentProject.value?.startDate &&
            form.dueDate <
                currentProject.value.startDate
        ) {
            errors.dueDate =
                "Due date cannot be before the project start date.";
            return;
        }

        errors.dueDate = null;
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

    resetForm();

    open.value = false;

}


// =========================================================
// Update Task
// =========================================================

async function updateTask() {
    if (!props.task) {
        return;
    }

    if (!hasChanges.value) {
        return;
    }

    if (!validateForm()) {
        return;
    }

    saving.value = true;

    try {
        const updatedTask =
            await taskStore.updateTask(
                props.task.id,
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
                        canAssign.value
                            ? form.assignedToId
                            : props.task.assignedTo?.id ?? null,
                },
            );

        emit(
            "updated",
            updatedTask,
        );

        close();

    } catch (error) {
        console.error(
            "Failed to update task:",
            error,
        );

        errors.project =
            "Failed to update task. Please try again.";

    } finally {
        saving.value = false;
    }
}

// =========================================================
// Delete Task
// =========================================================

// =========================================================
// Delete Task
// =========================================================

function requestDeleteTask() {

    if (
        !props.task ||
        !canDeleteTask.value
    ) {
        return;
    }

    showDeleteConfirmation.value = true;
}


function cancelDeleteTask() {

    if (deleting.value) {
        return;
    }

    showDeleteConfirmation.value = false;
}


async function confirmDeleteTask() {

    if (
        !props.task ||
        deleting.value
    ) {
        return;
    }

    const taskId =
        props.task.id;

    deleting.value = true;

    clearErrors();

    try {

        await taskStore.deleteTask(
            taskId
        );

        showDeleteConfirmation.value = false;

        emit(
            "deleted",
            taskId
        );

        close();

    } catch (error) {

        console.error(
            "Failed to delete task:",
            error
        );

        toast.error(
            "Failed to delete task. Please try again."
        );
        
        showDeleteConfirmation.value = false;

    } finally {

        deleting.value = false;

    }
}



</script>


<template>

    <Transition name="fade">

        <div
            v-if="open"
            class="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-slate-950/40
                p-6
                backdrop-blur-sm
            "
        >

            <div
                class="
                    w-full
                    max-w-4xl
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
                "
            >

                <!-- ================================================= -->
                <!-- Header -->
                <!-- ================================================= -->

                <div
                    class="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-100
                        px-10
                        py-6
                    "
                >

                    <div
                        class="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <div
                            class="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-900
                            "
                        >

                            <ListTodo
                                class="h-6 w-6 text-white"
                            />

                        </div>

                        <div>

                            <h2
                                class="
                                    text-lg
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Update Task
                            </h2>

                            <p
                                class="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Update the selected project task.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        @click="close"
                        class="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            transition
                            hover:bg-slate-100
                        "
                    >

                        <X
                            class="h-5 w-5 text-slate-500"
                        />

                    </button>

                </div>


                <!-- ================================================= -->
                <!-- Form -->
                <!-- ================================================= -->

                <div
                    class="
                        max-h-[70vh]
                        space-y-6
                        overflow-y-auto
                        px-10
                        py-8
                    "
                >

                    <!-- Task Title -->

                    <div>

                        <label
                            class="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-600
                            "
                        >
                            Task Title
                        </label>

                        <input
                            v-model="form.title"
                            type="text"
                            placeholder="Task title"
                            :class="[
                                'mt-2 h-12 w-full rounded-lg border bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4 focus:ring-slate-900/5',

                                errors.title
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-slate-200 focus:border-slate-900'
                            ]"
                        />

                        <p
                            v-if="errors.title"
                            class="mt-1.5 text-xs text-red-500"
                        >
                            {{ errors.title }}
                        </p>

                    </div>


                    <!-- Description -->

                    <div>

                        <label
                            class="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-600
                            "
                        >
                            Description
                        </label>

                        <textarea
                            v-model="form.description"
                            rows="4"
                            maxlength="2000"
                            placeholder="Describe what needs to be completed..."
                            :class="[
                                'mt-2 w-full resize-none rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4 focus:ring-slate-900/5',

                                errors.description
                                    ? 'border-red-300'
                                    : 'border-slate-200'
                            ]"
                        />

                        <p
                            v-if="errors.description"
                            class="mt-1.5 text-xs text-red-500"
                        >
                            {{ errors.description }}
                        </p>

                    </div>


                    <!-- Status + Priority -->

                    <div
                        class="
                            grid
                            grid-cols-1
                            gap-5
                            sm:grid-cols-2
                        "
                    >

                        <!-- Status -->

                        <div>

                            <label
                                class="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-slate-600
                                "
                            >
                                Status
                            </label>

                            <select
                                v-model="form.status"
                                class="
                                    mt-2
                                    h-12
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-3
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    focus:bg-white
                                    focus:border-slate-900
                                "
                            >

                                <option
                                    :value="TaskStatus.Todo"
                                >
                                    To Do
                                </option>

                                <option
                                    :value="TaskStatus.InProgress"
                                >
                                    In Progress
                                </option>

                                <option
                                    :value="TaskStatus.Review"
                                >
                                    Review
                                </option>

                                <option
                                    :value="TaskStatus.Done"
                                >
                                    Done
                                </option>

                            </select>

                        </div>


                        <!-- Priority -->

                        <div>

                            <label
                                class="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-slate-600
                                "
                            >
                                Priority
                            </label>

                            <select
                                v-model="form.priority"
                                class="
                                    mt-2
                                    h-12
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-3
                                    text-sm
                                    text-slate-800
                                    outline-none
                                    focus:bg-white
                                    focus:border-slate-900
                                "
                            >

                                <option
                                    :value="TaskPriority.Low"
                                >
                                    Low
                                </option>

                                <option
                                    :value="TaskPriority.Medium"
                                >
                                    Medium
                                </option>

                                <option
                                    :value="TaskPriority.High"
                                >
                                    High
                                </option>

                                <option
                                    :value="TaskPriority.Critical"
                                >
                                    Critical
                                </option>

                            </select>

                        </div>

                    </div>


                    <!-- Due Date + Assigned To -->

                    <div
                        :class="[
                            'grid gap-5',

                            canAssign
                                ? 'grid-cols-1 sm:grid-cols-2'
                                : 'grid-cols-1'
                        ]"
                    >

                        <!-- Due Date -->

                        <div>

                            <label
                                class="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-slate-600
                                "
                            >
                                Due Date
                            </label>

                            <input
                                v-model="form.dueDate"
                                type="date"
                                :min="minDueDate"
                                :max="maxDueDate"
                                :class="[
                                    'mt-2 h-12 w-full rounded-lg border bg-slate-50 px-3 text-sm text-slate-800 outline-none',

                                    errors.dueDate
                                        ? 'border-red-300'
                                        : 'border-slate-200'
                                ]"
                            />

                            <p
                                v-if="errors.dueDate"
                                class="mt-1.5 text-xs text-red-500"
                            >
                                {{ errors.dueDate }}
                            </p>

                            <p
                                v-else-if="projectEndDateLabel"
                                class="mt-1.5 text-xs text-slate-500"
                            >
                                Due date must be on or before
                                {{ projectEndDateLabel }}.
                            </p>

                        </div>


                        <!-- Assigned To -->

                        <div v-if="canAssign">

                            <label
                                class="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-slate-600
                                "
                            >
                                Assigned To
                            </label>

                            <select
                                v-model="form.assignedToId"
                                :disabled="
                                    workspaceMemberStore.loading
                                "
                                class="
                                    mt-2
                                    h-12
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-3
                                    text-sm
                                    text-slate-800
                                    outline-none
                                "
                            >

                                <option :value="null">
                                    Unassigned
                                </option>

                                <option
                                    v-for="member in members"
                                    :key="member.id"
                                    :value="member.id"
                                >
                                    {{ member.name }}
                                </option>

                            </select>

                            <p
                                v-if="errors.assignedToId"
                                class="mt-1.5 text-xs text-red-500"
                            >
                                {{ errors.assignedToId }}
                            </p>

                        </div>

                    </div>


                    <!-- Role Information -->

                    <div
                        class="
                            flex
                            items-center
                            gap-3
                            rounded-lg
                            border
                            border-blue-100
                            bg-blue-50
                            px-4
                            py-3
                        "
                    >

                        <div
                            class="
                                h-2
                                w-2
                                shrink-0
                                rounded-full
                                bg-blue-600
                            "
                        />

                        <p
                            class="
                                text-sm
                                text-blue-700
                            "
                        >

                            <template v-if="canAssign">

                                You are the project owner and can
                                update this task and its assignment.

                            </template>

                            <template v-else>

                                You can update this task, but the
                                project owner manages its assignment.

                            </template>

                        </p>

                    </div>


                    <!-- Error -->

                    <p
                        v-if="errors.project"
                        class="text-sm text-red-500"
                    >
                        {{ errors.project }}
                    </p>

                </div>


<!-- ================================================= -->
<!-- Footer -->
<!-- ================================================= -->

<div
    class="
        flex
        items-center
        justify-between
        gap-3
        border-t
        border-slate-100
        bg-slate-50
        px-10
        py-5
    "
>

    <!-- Delete -->

    <button
    v-if="canDeleteTask"
    type="button"
    @click="requestDeleteTask"
    :disabled="deleting"
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
    "
>
    <Trash2
        class="h-4 w-4"
    />

    <span>
        Delete Task
    </span>
</button>


    <!-- Empty space when delete isn't available -->

    <div
        v-else
        class="flex-1"
    />


    <!-- Normal Actions -->

    <div
        class="
            flex
            items-center
            gap-3
        "
    >

        <button
            type="button"
            @click="close"
            :disabled="deleting"
            class="
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
            "
        >
            Cancel
        </button>


        <button
            type="button"
            @click="updateTask"
            :disabled="
                !canUpdateTask ||
                deleting
            "
            :class="[
                'h-11 rounded-lg px-6 text-sm font-semibold text-white shadow-sm transition',

                canUpdateTask && !deleting
                    ? 'bg-slate-900 hover:bg-black'
                    : 'cursor-not-allowed bg-slate-300'
            ]"
        >

            <span v-if="saving">
                Saving...
            </span>

            <span v-else>
                Update Task
            </span>

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

    <div
        v-if="showDeleteConfirmation"
        class="
            fixed
            inset-0
            z-60
            flex
            items-center
            justify-center
            bg-slate-950/40
            p-6
            backdrop-blur-sm
        "
        @click.self="cancelDeleteTask"
    >

        <div
            class="
                w-full
                max-w-2xl
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-white
                shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
            "
        >

            <!-- ================================================= -->
            <!-- Header -->
            <!-- ================================================= -->

            <div
                class="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-100
                    px-8
                    py-5
                "
            >

                <div
                    class="
                        flex
                        items-center
                        gap-4
                    "
                >

                    <div
                        class="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-red-50
                        "
                    >

                        <AlertTriangle
                            class="
                                h-5
                                w-5
                                text-red-600
                            "
                        />

                    </div>

                    <div>

                        <h2
                            class="
                                text-lg
                                font-bold
                                text-slate-900
                            "
                        >
                            Delete Task
                        </h2>

                        <p
                            class="
                                mt-0.5
                                text-sm
                                text-slate-500
                            "
                        >
                            This action cannot be undone.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    @click="cancelDeleteTask"
                    :disabled="deleting"
                    class="
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
                    "
                >

                    <X
                        class="
                            h-5
                            w-5
                            text-slate-500
                        "
                    />

                </button>

            </div>


            <!-- ================================================= -->
            <!-- Content -->
            <!-- ================================================= -->

            <div
                class="
                    px-8
                    py-6
                "
            >

                <p
                    class="
                        text-sm
                        leading-6
                        text-slate-600
                    "
                >
                    Are you sure you want to delete this task?
                </p>


                <!-- Task Preview -->

                <div
                    v-if="props.task"
                    class="
                        mt-4
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50
                        px-5
                        py-4
                    "
                >

                    <p
                        class="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-900
                        "
                    >
                        {{ props.task.title }}
                    </p>

                    <p
                        class="
                            mt-1
                            text-xs
                            text-slate-500
                        "
                    >
                        This task and its associated data will be
                        permanently removed.
                    </p>

                </div>


                <!-- Warning -->

                <div
                    class="
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
                    "
                >

                    <AlertTriangle
                        class="
                            h-4
                            w-4
                            shrink-0
                            text-red-600
                        "
                    />

                    <p
                        class="
                            text-xs
                            leading-5
                            text-red-700
                        "
                    >
                        Deleting this task is permanent and
                        cannot be reversed.
                    </p>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- Footer -->
            <!-- ================================================= -->

            <div
                class="
                    flex
                    items-center
                    justify-end
                    gap-3
                    border-t
                    border-slate-100
                    bg-slate-50
                    px-8
                    py-5
                "
            >

                <button
                    type="button"
                    @click="cancelDeleteTask"
                    :disabled="deleting"
                    class="
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
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    @click="confirmDeleteTask"
                    :disabled="deleting"
                    class="
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
                    "
                >

                    <Trash2
                        v-if="!deleting"
                        class="h-4 w-4"
                    />

                    <span>
                        {{ deleting ? "Deleting..." : "Delete Task" }}
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