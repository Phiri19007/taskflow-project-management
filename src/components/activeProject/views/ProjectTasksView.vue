<script setup lang="ts">

import {
    computed,
    onMounted,
    ref,
} from 'vue'

import {
    useRoute,
} from 'vue-router'

import AddButton from '@/components/AddButton.vue'
import CreateProjectTaskDialog from '@/components/dialogs/CreateProjectTaskDialog.vue'
import TaskDetailsDialog from '@/components/dialogs/TaskDetailsDialog.vue'
import UpdateProjectTaskDialog from '@/components/dialogs/updateProjectTaskDialog.vue'

import { useTaskStore } from '@/services/stores/task.store'
import { useWorkspaceStore } from '@/services/stores/workspace.store'
import { useAppStore } from '@/services/stores/app.store'
import { useToastStore } from "@/services/stores/toast.store";
import { useProjectStore } from '@/services/stores/project.store'

import {
    ProjectStatus,
} from '@/types/project'


import {
    TaskStatus,
    TaskPriority,
    type Task,
    type CreateTaskData,
} from '@/types/task'


// =========================================================
// Stores
// =========================================================

const route = useRoute()

const taskStore = useTaskStore()
const workspaceStore = useWorkspaceStore()
const appStore = useAppStore()
const toast = useToastStore()
const projectStore = useProjectStore() 

const currentProject = computed(() =>
    projectStore.currentProject
)

const projectStatus = computed(() =>
    currentProject.value?.status ?? null
)

const isProjectActive = computed(() =>
    projectStatus.value === ProjectStatus.ACTIVE
)

const canCreateTask = computed(() =>
    isProjectActive.value
)


// =========================================================
// Create task dialog
// =========================================================

const createProjectTaskOpen = ref(false)

function handleButtonAction() {

    createProjectTaskOpen.value = true

}

// =========================================================
// Task details dialog
// =========================================================

const taskDetailsOpen = ref(false)

const selectedTask = ref<Task | null>(null)


const openTaskDetails = (
    task: Task,
) => {

    selectedTask.value = task

    taskDetailsOpen.value = true

}


const closeTaskDetails = () => {

    taskDetailsOpen.value = false

    selectedTask.value = null

}

// Task Update Dialog

const taskUpdateOpen = ref(false)

const taskToUpdate = ref<
    (typeof taskStore.tasks[number]) | null
>(null)

const taskUpdateRole = ref<
    "owner" | "assignee"
>("assignee")



// =========================================================
// Project ID
// =========================================================

const projectId = computed(() => {

    const id = Number(
        route.params.projectId
    )

    return Number.isFinite(id) && id > 0
        ? id
        : null

})


// =========================================================
// Load tasks
// =========================================================

const loading = ref(false)

const loadTasks = async () => {

    if (!projectId.value) {

        console.error(
            'Invalid project ID'
        )

        return

    }


    loading.value = true

    try {

        /*
         * Make sure workspace is initialized.
         */
        if (!workspaceStore.currentWorkspace) {

            await appStore.initializeWorkspace()

        }


        /*
         * Load tasks belonging to this project.
         */
        await taskStore.fetchTasks(
            projectId.value
        )

    } catch (error) {

        console.error(
            'Failed to load project tasks:',
            error
        )

    } finally {

        loading.value = false

    }

}


onMounted(() => {

    loadTasks()

})

function handleManageTask(
    task: typeof taskStore.tasks[number],
    role: "owner" | "assignee",
) {

    taskToUpdate.value = task

    taskUpdateRole.value = role

    taskUpdateOpen.value = true

}

function closeTaskUpdate() {

    taskUpdateOpen.value = false

    taskToUpdate.value = null

}

// =========================================================
// Create task
// =========================================================

const handleCreateTask = async (
    taskData: CreateTaskData,
) => {

    if (!projectId.value) {
        toast.error('Invalid project ID.')
        return
    }

    try {

        await taskStore.createTask(
            projectId.value,
            taskData,
        )

        toast.success(
            taskData.assignedToId
                ? 'New task created and assigned successfully.'
                : 'New task created successfully.'
        )

        createProjectTaskOpen.value = false

    } catch (error) {

        console.error(
            'Failed to create task:',
            error,
        )

        toast.error(
            'Failed to create task. Please try again.'
        )

    }

}


// =========================================================
// Statistics
// =========================================================

const totalTasks = computed(() => {

    return taskStore.tasks.length

})


const completedTasks = computed(() => {

    return taskStore.tasks.filter(
        task =>
            task.status === TaskStatus.Done
    ).length

})


const inProgressTasks = computed(() => {

    return taskStore.tasks.filter(
        task =>
            task.status === TaskStatus.InProgress
    ).length

})


const todoTasks = computed(() => {

    return taskStore.tasks.filter(
        task =>
            task.status === TaskStatus.Todo
    ).length

})


const reviewTasks = computed(() => {

    return taskStore.tasks.filter(
        task =>
            task.status === TaskStatus.Review
    ).length

})


// =========================================================
// Status classes
// =========================================================

const statusClasses = (
    status: TaskStatus,
) => {

    switch (status) {

        case TaskStatus.Done:

            return 'bg-emerald-50 text-emerald-600'


        case TaskStatus.InProgress:

            return 'bg-blue-50 text-blue-600'


        case TaskStatus.Review:

            return 'bg-amber-50 text-amber-600'


        case TaskStatus.Todo:

            return 'bg-slate-100 text-slate-500'


        default:

            return 'bg-slate-100 text-slate-500'

    }

}


// =========================================================
// Priority classes
// =========================================================

const priorityClasses = (
    priority: TaskPriority,
) => {

    switch (priority) {

        case TaskPriority.Critical:

            return 'bg-red-50 text-red-700'


        case TaskPriority.High:

            return 'bg-red-50 text-red-600'


        case TaskPriority.Medium:

            return 'bg-amber-50 text-amber-600'


        case TaskPriority.Low:

            return 'bg-emerald-50 text-emerald-600'


        default:

            return 'bg-slate-100 text-slate-500'

    }

}


// =========================================================
// Due date
// =========================================================

const formatDueDate = (
    date: string | null | undefined,
) => {

    if (!date) {

        return '—'

    }


    const parsedDate =
        new Date(date)


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return '—'

    }


    return new Intl.DateTimeFormat(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }
    ).format(parsedDate)

}


// =========================================================
// Assignee
// =========================================================

const getAssigneeName = (
    task: Task,
) => {

    return task.assignedTo?.fullName ?? 'Unassigned'

}


const getAssigneeInitials = (
    task: Task,
) => {

    const name =
        task.assignedTo?.fullName


    if (!name) {

        return '—'

    }


    return name
        .split(' ')
        .filter(Boolean)
        .map(
            part => part.charAt(0)
        )
        .slice(0, 2)
        .join('')
        .toUpperCase()

}


// =========================================================
// Description
// =========================================================

const getDescription = (
    task: Task,
) => {

    return task.description || 'No description'

}

async function handleTaskUpdated() {

    closeTaskUpdate()

    /*
     * always displays the latest task.
     */
    if (!projectId.value) {
        return
    }

    try {

        await taskStore.fetchTasks(
            projectId.value
        )

        toast.success(
            'Task updated successfully.'
        )

    } catch (error) {

        console.error(
            'Failed to reload tasks:',
            error,
        )

        toast.error(
            'Task was updated, but the calendar could not be refreshed.'
        )

    }

}

function handleTaskDeleted(
    taskId: number
) {

    selectedTask.value = null;

    closeTaskUpdate();

    toast.success(
        'Task deleted successfully.'
    );

}



</script>


<template>

    <main class="py-7">

        <!-- ================================================= -->
        <!-- Section Header -->
        <!-- ================================================= -->

        <TaskDetailsDialog :show="taskDetailsOpen" :task="selectedTask" @close="closeTaskDetails"
            @manage="handleManageTask" />

        <div class="mb-6
                   flex
                   flex-col
                   gap-4
                   sm:flex-row
                   sm:items-end
                   sm:justify-between">

            <div>

                <h2 class="text-sm
                           font-semibold
                           text-slate-900">
                    Project tasks
                </h2>


                <p class="mt-1
                           text-xs
                           text-slate-400">
                    View and manage all tasks assigned to this project.
                </p>

            </div>


            <!-- Add Task -->

            <AddButton label="Add task" @click="handleButtonAction" v-if="canCreateTask" />

        </div>


        <!-- ================================================= -->
        <!-- Create Task Dialog -->
        <!-- ================================================= -->

        <CreateProjectTaskDialog v-model:open="createProjectTaskOpen" @created="handleCreateTask" />
        <UpdateProjectTaskDialog v-model:open="taskUpdateOpen" :task="taskToUpdate" :role="taskUpdateRole"
            @updated="handleTaskUpdated" @deleted="handleTaskDeleted" />


        <!-- ================================================= -->
        <!-- Task Statistics -->
        <!-- ================================================= -->

        <div class="grid
                   grid-cols-2
                   overflow-hidden
                   rounded-xl
                   border
                   border-slate-100
                   lg:grid-cols-4">

            <!-- Total -->

            <div class="bg-white
                       px-5
                       py-4
                       lg:border-r
                       lg:border-slate-100">

                <p class="text-xs
                           font-medium
                           text-slate-400">
                    Total tasks
                </p>


                <p class="mt-2
                           text-2xl
                           font-semibold
                           tracking-tight
                           text-slate-900">
                    {{ totalTasks }}
                </p>

            </div>


            <!-- Completed -->

            <div class="border-t
                       border-slate-100
                       bg-white
                       px-5
                       py-4
                       lg:border-t-0
                       lg:border-r">

                <p class="text-xs
                           font-medium
                           text-slate-400">
                    Completed
                </p>


                <p class="mt-2
                           text-2xl
                           font-semibold
                           tracking-tight
                           text-slate-900">
                    {{ completedTasks }}
                </p>

            </div>


            <!-- In Progress -->

            <div class="border-t
                       border-slate-100
                       bg-white
                       px-5
                       py-4
                       lg:border-t-0
                       lg:border-r">

                <p class="text-xs
                           font-medium
                           text-slate-400">
                    In progress
                </p>


                <p class="mt-2
                           text-2xl
                           font-semibold
                           tracking-tight
                           text-slate-900">
                    {{ inProgressTasks }}
                </p>

            </div>


            <!-- Todo -->

            <div class="border-t
                       border-slate-100
                       bg-white
                       px-5
                       py-4
                       lg:border-t-0">

                <p class="text-xs
                           font-medium
                           text-slate-400">
                    Todo
                </p>


                <p class="mt-2
                           text-2xl
                           font-semibold
                           tracking-tight
                           text-slate-900">
                    {{ todoTasks }}
                </p>

            </div>

        </div>


        <!-- ================================================= -->
        <!-- Optional Review Summary -->
        <!-- ================================================= -->

        <div v-if="reviewTasks > 0" class="mt-3
                   text-right
                   text-[10px]
                   text-slate-400">
            {{ reviewTasks }} task{{ reviewTasks === 1 ? '' : 's' }} in review
        </div>


        <!-- ================================================= -->
        <!-- Task List -->
        <!-- ================================================= -->

        <section class="mt-5
                   overflow-hidden
                   rounded-xl
                   border
                   border-slate-100
                   bg-white">

            <!-- ================================================= -->
            <!-- Loading -->
            <!-- ================================================= -->

            <div v-if="loading" class="flex
                       min-h-48
                       items-center
                       justify-center">

                <p class="text-xs
                           text-slate-400">
                    Loading tasks...
                </p>

            </div>


            <template v-else>

                <!-- ================================================= -->
                <!-- Table Header -->
                <!-- ================================================= -->

                <div class="hidden
                           grid-cols-12
                           gap-4
                           border-b
                           border-slate-100
                           bg-slate-50/50
                           px-5
                           py-3
                           text-[10px]
                           font-semibold
                           uppercase
                           tracking-wide
                           text-slate-400
                           md:grid">

                    <div class="col-span-5">
                        Task
                    </div>


                    <div class="col-span-2">
                        Status
                    </div>


                    <div class="col-span-2">
                        Priority
                    </div>


                    <div class="col-span-2">
                        Assignee
                    </div>


                    <div class="col-span-1 text-right">
                        Due
                    </div>

                </div>


                <!-- ================================================= -->
                <!-- Task Rows -->
                <!-- ================================================= -->

                <div v-if="taskStore.tasks.length > 0" class="divide-y
                           divide-slate-100">

                    <div v-for="task in taskStore.tasks" :key="task.id" @click="openTaskDetails(task)" class="grid
                               grid-cols-1
                               gap-3
                               px-5
                               py-4
                               cursor-pointer
                               transition-colors
                               hover:bg-slate-50/50
                               md:grid-cols-12
                               md:items-center
                               md:gap-4">

                        <!-- ================================================= -->
                        <!-- Task -->
                        <!-- ================================================= -->

                        <div class="min-w-0
                                   md:col-span-5">

                            <div class="flex
                                       items-start
                                       gap-3">

                                <div class="flex
                                           h-7
                                           w-7
                                           shrink-0
                                           items-center
                                           justify-center
                                           rounded-lg
                                           bg-slate-50
                                           text-[10px]
                                           font-semibold
                                           text-slate-400">
                                    #{{ task.id }}
                                </div>


                                <div class="min-w-0">

                                    <p class="truncate
                                               text-xs
                                               font-semibold
                                               text-slate-700">
                                        {{ task.title }}
                                    </p>


                                    <p class="mt-0.5
                                               truncate
                                               text-[10px]
                                               text-slate-400">
                                        {{ getDescription(task) }}
                                    </p>

                                </div>

                            </div>

                        </div>


                        <!-- ================================================= -->
                        <!-- Status -->
                        <!-- ================================================= -->

                        <div class="flex
                                   items-center
                                   gap-2
                                   md:col-span-2">

                            <span class="inline-flex
                                       rounded-md
                                       px-2
                                       py-1
                                       text-[10px]
                                       font-semibold" :class="statusClasses(task.status)">
                                {{ task.status }}
                            </span>

                        </div>


                        <!-- ================================================= -->
                        <!-- Priority -->
                        <!-- ================================================= -->

                        <div class="md:col-span-2">

                            <span class="inline-flex
                                       rounded-md
                                       px-2
                                       py-1
                                       text-[10px]
                                       font-semibold" :class="priorityClasses(task.priority)">
                                {{ task.priority }}
                            </span>

                        </div>


                        <!-- ================================================= -->
                        <!-- Assignee -->
                        <!-- ================================================= -->

                        <div class="flex
                                   items-center
                                   gap-2
                                   md:col-span-2">

                            <div class="flex
                                       h-7
                                       w-7
                                       shrink-0
                                       items-center
                                       justify-center
                                       rounded-full
                                       bg-slate-100
                                       text-[9px]
                                       font-semibold
                                       text-slate-600">
                                {{ getAssigneeInitials(task) }}
                            </div>


                            <span class="truncate
                                       text-[10px]
                                       font-medium
                                       text-slate-500">
                                {{ getAssigneeName(task) }}
                            </span>

                        </div>


                        <!-- ================================================= -->
                        <!-- Due Date -->
                        <!-- ================================================= -->

                        <div class="text-left
                                   md:col-span-1
                                   md:text-right">

                            <span class="text-[10px]
                                       text-slate-400">
                                {{ formatDueDate(task.dueDate) }}
                            </span>

                        </div>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- Empty State -->
                <!-- ================================================= -->

                <div v-else class="flex
                           min-h-48
                           flex-col
                           items-center
                           justify-center
                           px-5
                           text-center">

                    <div class="flex
                               h-9
                               w-9
                               items-center
                               justify-center
                               rounded-lg
                               bg-slate-50
                               text-slate-300">
                        +
                    </div>


                    <p class="mt-3
                               text-xs
                               font-medium
                               text-slate-500">
                        No tasks yet
                    </p>


                    <p class="mt-1
                               text-[11px]
                               text-slate-400">
                        Create the first task for this project.
                    </p>

                </div>

            </template>

        </section>


        <!-- ================================================= -->
        <!-- Footer Summary -->
        <!-- ================================================= -->

        <div class="mt-4
                   flex
                   items-center
                   justify-between">

            <p class="text-[11px]
                       text-slate-400">
                Showing {{ taskStore.tasks.length }} task{{
                    taskStore.tasks.length === 1 ? '' : 's'
                }}
            </p>


            <div class="flex
                       items-center
                       gap-2">

                <button type="button" disabled class="flex
                           h-8
                           items-center
                           rounded-lg
                           border
                           border-slate-200
                           px-3
                           text-[11px]
                           font-medium
                           text-slate-300">
                    Previous
                </button>


                <button type="button" disabled class="flex
                           h-8
                           items-center
                           rounded-lg
                           border
                           border-slate-200
                           px-3
                           text-[11px]
                           font-medium
                           text-slate-300">
                    Next
                </button>

            </div>

        </div>

    </main>

</template>