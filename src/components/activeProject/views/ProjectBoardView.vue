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

import { useTaskStore } from '@/services/stores/task.store'
import { useProjectStore } from '@/services/stores/project.store'
import { useWorkspaceStore } from '@/services/stores/workspace.store'
import { useAppStore } from '@/services/stores/app.store'
import { useToastStore } from '@/services/stores/toast.store'

import {
    TaskStatus,
    TaskPriority,
    type Task,
    type CreateTaskData,
} from '@/types/task'

import {
    ProjectStatus,
} from '@/types/project'


// =========================================================
// Stores
// =========================================================

const route = useRoute()

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()
const appStore = useAppStore()
const toast = useToastStore()


// =========================================================
// Page state
// =========================================================

const isLoading = ref(false)

const loadError = ref<string | null>(null)

const createProjectTaskOpen = ref(false)


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
// Current project
// =========================================================

const currentProject = computed(() =>
    projectStore.currentProject
)


// =========================================================
// Project status
// =========================================================

const projectStatus = computed(() =>
    currentProject.value?.status ?? null
)


// =========================================================
// Project status helpers
// =========================================================

const isProjectActive = computed(() =>
    projectStatus.value === ProjectStatus.ACTIVE
)



// =========================================================
// Project permissions
// =========================================================

const canCreateTask = computed(() =>
    isProjectActive.value
)


// =========================================================
// Load project
// =========================================================

const loadProject = async () => {

    if (!projectId.value) {

        loadError.value =
            'Invalid project ID.'

        return

    }


    const workspace =
        workspaceStore.currentWorkspace


    if (!workspace) {

        loadError.value =
            'Workspace is not available.'

        return

    }


    try {

        await projectStore.fetchProject(
            workspace.id,
            projectId.value
        )

    } catch (error) {

        console.error(
            'Failed to load project:',
            error,
        )


        loadError.value =
            'Unable to load project.'

        throw error

    }

}


// =========================================================
// Load project tasks
// =========================================================

const loadTasks = async () => {

    if (!projectId.value) {

        loadError.value =
            'Invalid project ID.'

        return

    }


    try {

        /*
         * Load tasks for this project.
         *
         * This replaces the contents of
         * the Pinia task store.
         */
        await taskStore.fetchTasks(
            projectId.value
        )

    } catch (error) {

        console.error(
            'Failed to load project tasks:',
            error,
        )


        loadError.value =
            'Unable to load project tasks.'

        throw error

    }

}


// =========================================================
// Initial load
// =========================================================

onMounted(async () => {

    isLoading.value = true

    loadError.value = null


    try {

        /*
         * Make sure workspace is initialized
         * before loading the project.
         */
        if (!workspaceStore.currentWorkspace) {

            await appStore.initializeWorkspace()

        }


        /*
         * Load the project first.
         *
         * The project gives us the real project
         * status.
         */
        await loadProject()


        /*
         * Then load the tasks belonging to
         * this project.
         */
        await loadTasks()

    } catch (error) {

        console.error(
            'Failed to initialize project page:',
            error,
        )

    } finally {

        isLoading.value = false

    }

})


// =========================================================
// Store state
// =========================================================

const tasks = computed(() =>
    taskStore.tasks
)


const hasTasks = computed(() =>
    tasks.value.length > 0
)


// =========================================================
// Board columns
// =========================================================

const boardColumns = computed(() => {

    return [

        {
            id: TaskStatus.Todo,
            title: 'Todo',
            color: 'bg-slate-400',

            tasks: taskStore.tasks.filter(
                task =>
                    task.status === TaskStatus.Todo
            ),
        },


        {
            id: TaskStatus.InProgress,
            title: 'In Progress',
            color: 'bg-blue-500',

            tasks: taskStore.tasks.filter(
                task =>
                    task.status === TaskStatus.InProgress
            ),
        },


        {
            id: TaskStatus.Review,
            title: 'Review',
            color: 'bg-amber-500',

            tasks: taskStore.tasks.filter(
                task =>
                    task.status === TaskStatus.Review
            ),
        },


        {
            id: TaskStatus.Done,
            title: 'Completed',
            color: 'bg-emerald-500',

            tasks: taskStore.tasks.filter(
                task =>
                    task.status === TaskStatus.Done
            ),
        },

    ]

})


// =========================================================
// Drag state
// =========================================================

const draggedTask = ref<Task | null>(null)

const draggedFromColumn =
    ref<TaskStatus | null>(null)

const dragOverColumn =
    ref<TaskStatus | null>(null)

const isUpdatingTask = ref(false)


// =========================================================
// Drag start
// =========================================================

const handleDragStart = (
    task: Task,
    columnId: TaskStatus,
    event: DragEvent,
) => {

    /*
     * Don't allow another drag while
     * a previous task update is running.
     */
    if (isUpdatingTask.value) {
        return
    }


    /*
     * Only active projects can modify tasks.
     */
    if (!canCreateTask.value) {
        return
    }


    draggedTask.value = task

    draggedFromColumn.value = columnId


    if (event.dataTransfer) {

        event.dataTransfer.effectAllowed = 'move'

        event.dataTransfer.setData(
            'text/plain',
            String(task.id),
        )

    }

}


// =========================================================
// Drag end
// =========================================================

const handleDragEnd = () => {

    draggedTask.value = null

    draggedFromColumn.value = null

    dragOverColumn.value = null

}


// =========================================================
// Drag over
// =========================================================

const handleDragOver = (
    columnId: TaskStatus,
    event: DragEvent,
) => {

    /*
     * Only active projects can modify tasks.
     */
    if (!canCreateTask.value) {
        return
    }


    event.preventDefault()


    if (event.dataTransfer) {

        event.dataTransfer.dropEffect = 'move'

    }


    dragOverColumn.value = columnId

}


// =========================================================
// Drag leave
// =========================================================

const handleDragLeave = (
    columnId: TaskStatus,
) => {

    if (
        dragOverColumn.value === columnId
    ) {

        dragOverColumn.value = null

    }

}


// =========================================================
// Update task status
// =========================================================

const updateTaskStatus = async (
    task: Task,
    newStatus: TaskStatus,
    previousStatus: TaskStatus,
) => {

    /*
     * Only active projects can modify tasks.
     */
    if (!canCreateTask.value) {
        return
    }


    /*
     * Optimistic update.
     */
    task.status = newStatus

    isUpdatingTask.value = true


    try {

        /*
         * Persist the change here when
         * the task store API is ready.
         *
         * await taskStore.updateTask(
         *     task.id,
         *     {
         *         status: newStatus,
         *         title: task.title,
         *         description: task.description,
         *         priority: task.priority,
         *         dueDate: task.dueDate,
         *     },
         * )
         */

    } catch (error) {

        console.error(
            'Failed to update task status:',
            error,
        )


        /*
         * Roll back if the backend update fails.
         */
        task.status = previousStatus

    } finally {

        isUpdatingTask.value = false

    }

}


// =========================================================
// Drop
// =========================================================

const handleDrop = async (
    targetColumnId: TaskStatus,
    event: DragEvent,
) => {

    event.preventDefault()


    /*
     * Only active projects can modify tasks.
     */
    if (!canCreateTask.value) {

        handleDragEnd()

        return

    }


    const task =
        draggedTask.value

    const sourceColumnId =
        draggedFromColumn.value


    /*
     * Nothing is being dragged.
     */
    if (
        !task ||
        !sourceColumnId
    ) {

        handleDragEnd()

        return

    }


    /*
     * Dropped into the same column.
     */
    if (
        sourceColumnId === targetColumnId
    ) {

        handleDragEnd()

        return

    }


    /*
     * Save the original status.
     */
    const previousStatus =
        task.status


    /*
     * Persist the change.
     */
    await updateTaskStatus(
        task,
        targetColumnId,
        previousStatus,
    )


    handleDragEnd()

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
            return 'bg-slate-50 text-slate-500'

    }

}


// =========================================================
// Priority label
// =========================================================

const priorityLabel = (
    priority: TaskPriority,
) => {

    switch (priority) {

        case TaskPriority.Critical:
            return 'Critical'

        case TaskPriority.High:
            return 'High'

        case TaskPriority.Medium:
            return 'Medium'

        case TaskPriority.Low:
            return 'Low'

        default:
            return priority

    }

}


// =========================================================
// Format due date
// =========================================================

const formatDueDate = (
    date: string | null,
) => {

    if (!date) {
        return null
    }


    const parsedDate =
        new Date(date)


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return null

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
// Assignee name
// =========================================================

const getAssigneeName = (
    task: Task,
) => {

    return task.assignedTo?.fullName
        ?? 'Unassigned'

}


// =========================================================
// Assignee initials
// =========================================================

const getInitials = (
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
            part => part[0]
        )
        .slice(0, 2)
        .join('')
        .toUpperCase()

}


// =========================================================
// Create task dialog
// =========================================================

const handleButtonAction = () => {

    /*
     * Only active projects can create tasks.
     */
    if (!canCreateTask.value) {
        return
    }


    createProjectTaskOpen.value = true

}


// =========================================================
// Task created
// =========================================================

const handleCreateTask = async (
    taskData: CreateTaskData,
) => {

    if (!projectId.value) {

        toast.error(
            'Invalid project ID.'
        )

        return

    }


    /*
     * Only active projects can create tasks.
     */
    if (!canCreateTask.value) {

        toast.error(
            'Tasks cannot be created for this project.'
        )

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

</script>

<template>

    <main class="py-7">


        <!-- ================================================= -->
        <!-- Create Task Dialog -->
        <!-- ================================================= -->

        <CreateProjectTaskDialog v-model:open="createProjectTaskOpen" @created="handleCreateTask" />


        <!-- ================================================= -->
        <!-- Section Header -->
        <!-- ================================================= -->

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
                    Project board
                </h2>


                <p class="mt-1
                           text-xs
                           text-slate-400">
                    Manage project tasks across their current stages.
                </p>

            </div>


            <!-- Add Task -->

            <AddButton label="Add task" @click="handleButtonAction" v-if="canCreateTask"/>

        </div>


        <!-- ================================================= -->
        <!-- Loading -->
        <!-- ================================================= -->

        <section v-if="isLoading" class="rounded-xl
                   border
                   border-slate-100
                   bg-white
                   p-10
                   text-center">

            <div class="mx-auto
                       h-6
                       w-6
                       animate-spin
                       rounded-full
                       border-2
                       border-slate-200
                       border-t-slate-700"></div>


            <p class="mt-4
                       text-xs
                       font-medium
                       text-slate-600">
                Loading project tasks...
            </p>


            <p class="mt-1
                       text-[11px]
                       text-slate-400">
                Please wait while the board is loaded.
            </p>

        </section>


        <!-- ================================================= -->
        <!-- Error -->
        <!-- ================================================= -->

        <section v-else-if="loadError" class="rounded-xl
                   border
                   border-red-100
                   bg-red-50/50
                   p-8
                   text-center">

            <div class="mx-auto
                       flex
                       h-10
                       w-10
                       items-center
                       justify-center
                       rounded-full
                       bg-red-100
                       text-red-600">
                !
            </div>


            <p class="mt-3
                       text-xs
                       font-semibold
                       text-slate-700">
                Unable to load tasks
            </p>


            <p class="mt-1
                       text-[11px]
                       text-slate-400">
                {{ loadError }}
            </p>


            <button type="button" class="mt-5
                       rounded-lg
                       border
                       border-slate-200
                       bg-white
                       px-4
                       py-2
                       text-xs
                       font-medium
                       text-slate-600
                       transition-colors
                       hover:bg-slate-50" @click="loadTasks">
                Try again
            </button>

        </section>


        <!-- ================================================= -->
        <!-- Empty Store -->
        <!-- ================================================= -->

        <section v-else-if="!hasTasks" class="rounded-xl
                   border
                   border-slate-100
                   bg-white
                   px-6
                   py-14
                   text-center">

            <div class="mx-auto
                       flex
                       h-12
                       w-12
                       items-center
                       justify-center
                       rounded-full
                       bg-slate-100
                       text-slate-400">
                +
            </div>


            <h3 class="mt-4
                       text-sm
                       font-semibold
                       text-slate-800">
                No tasks yet
            </h3>


            <p class="mx-auto
                       mt-1
                       max-w-sm
                       text-xs
                       leading-5
                       text-slate-400">
                This project doesn't have any tasks yet.
                Create your first task to start managing the project.
            </p>


        </section>


        <!-- ================================================= -->
        <!-- Board -->
        <!-- ================================================= -->

        <template v-else>


            <div class="grid
                       grid-cols-1
                       gap-5
                       lg:grid-cols-4">


                <!-- ================================================= -->
                <!-- Board Column -->
                <!-- ================================================= -->

                <section v-for="column in boardColumns" :key="column.id" class="min-w-0
                           rounded-xl
                           transition-colors" :class="{
                            'bg-slate-50 ring-1 ring-slate-200':
                                dragOverColumn === column.id
                        }" @dragover="
                            handleDragOver(
                                column.id,
                                $event
                            )
                            " @dragleave="
                            handleDragLeave(
                                column.id
                            )
                            " @drop="
                            handleDrop(
                                column.id,
                                $event
                            )
                            ">


                    <!-- ================================================= -->
                    <!-- Column Header -->
                    <!-- ================================================= -->

                    <div class="mb-3
                               flex
                               items-center
                               justify-between">

                        <div class="flex
                                   items-center
                                   gap-2">

                            <span class="h-2
                                       w-2
                                       rounded-full" :class="column.color"></span>


                            <h3 class="text-xs
                                       font-semibold
                                       text-slate-700">
                                {{ column.title }}
                            </h3>


                            <span class="inline-flex
                                       min-w-5
                                       items-center
                                       justify-center
                                       rounded-full
                                       bg-slate-100
                                       px-1.5
                                       py-0.5
                                       text-[10px]
                                       font-medium
                                       text-slate-500">
                                {{ column.tasks.length }}
                            </span>

                        </div>


                        <button type="button" class="flex
                                   h-7
                                   w-7
                                   items-center
                                   justify-center
                                   rounded-md
                                   text-slate-400
                                   transition-colors
                                   hover:bg-slate-50
                                   hover:text-slate-700">
                            •••
                        </button>

                    </div>


                    <!-- ================================================= -->
                    <!-- Tasks -->
                    <!-- ================================================= -->

                    <div class="space-y-3">


                        <!-- ================================================= -->
                        <!-- Task Card -->
                        <!-- ================================================= -->

                        <article v-for="task in column.tasks" :key="task.id" draggable="true" @dragstart="
                            handleDragStart(
                                task,
                                column.id,
                                $event
                            )
                            " @dragend="handleDragEnd" class="cursor-grab
                                   rounded-xl
                                   border
                                   border-slate-100
                                   bg-white
                                   p-4
                                   transition
                                   hover:border-slate-200
                                   hover:shadow-sm
                                   active:cursor-grabbing" :class="{
                                    'opacity-50':
                                        draggedTask?.id === task.id,

                                    'pointer-events-none':
                                        isUpdatingTask
                                }">


                            <!-- Task Top -->

                            <div class="flex
                                       items-start
                                       justify-between
                                       gap-3">

                                <h4 class="min-w-0
                                           text-xs
                                           font-semibold
                                           leading-5
                                           text-slate-800">
                                    {{ task.title }}
                                </h4>


                                <button type="button" class="flex
                                           h-6
                                           w-6
                                           shrink-0
                                           items-center
                                           justify-center
                                           rounded-md
                                           text-slate-300
                                           hover:bg-slate-50
                                           hover:text-slate-600" @click.stop>
                                    •••
                                </button>

                            </div>


                            <!-- Description -->

                            <p v-if="task.description" class="mt-2
                                       line-clamp-2
                                       text-[11px]
                                       leading-5
                                       text-slate-400">
                                {{ task.description }}
                            </p>


                            <!-- Priority / Due Date -->

                            <div class="mt-3
                                       flex
                                       items-center
                                       justify-between
                                       gap-2">

                                <!-- Priority -->

                                <span class="inline-flex
                                           rounded-md
                                           px-2
                                           py-1
                                           text-[10px]
                                           font-semibold" :class="priorityClasses(
                                            task.priority
                                        )
                                            ">
                                    {{
                                        priorityLabel(
                                            task.priority
                                        )
                                    }}
                                </span>


                                <!-- Due Date -->

                                <span v-if="task.dueDate" class="text-[10px]
                                           text-slate-400">
                                    {{
                                        formatDueDate(
                                            task.dueDate
                                        )
                                    }}
                                </span>

                            </div>


                            <!-- Divider -->

                            <div class="my-3
                                       border-t
                                       border-slate-50"></div>


                            <!-- Assignee -->

                            <div class="flex
                                       items-center
                                       justify-between">

                                <div class="flex
                                           min-w-0
                                           items-center
                                           gap-2">

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
                                        {{ getInitials(task) }}
                                    </div>


                                    <span class="truncate
                                               text-[10px]
                                               font-medium
                                               text-slate-500">
                                        {{
                                            getAssigneeName(
                                                task
                                            )
                                        }}
                                    </span>

                                </div>


                                <!-- Task ID -->

                                <span class="text-[10px]
                                           text-slate-300">
                                    #{{ task.id }}
                                </span>

                            </div>

                        </article>


                        <!-- ================================================= -->
                        <!-- Empty Column -->
                        <!-- ================================================= -->

                        <div v-if="column.tasks.length === 0" class="flex
                                   min-h-24
                                   items-center
                                   justify-center
                                   rounded-xl
                                   border
                                   border-dashed
                                   border-slate-200
                                   bg-slate-50/50">

                            <p class="text-[11px]
                                       text-slate-400">
                                No tasks
                            </p>

                        </div>

                    </div>

                </section>

            </div>


            <!-- ================================================= -->
            <!-- Board Summary -->
            <!-- ================================================= -->

            <section class="mt-6
                       rounded-xl
                       border
                       border-slate-100
                       bg-white
                       p-5">

                <div class="flex
                           flex-col
                           gap-4
                           sm:flex-row
                           sm:items-center
                           sm:justify-between">

                    <div>

                        <h3 class="text-sm
                                   font-semibold
                                   text-slate-900">
                            Board summary
                        </h3>


                        <p class="mt-1
                                   text-xs
                                   text-slate-400">
                            Current distribution of tasks across the board.
                        </p>

                    </div>


                    <!-- Summary -->

                    <div class="flex
                               flex-wrap
                               items-center
                               gap-5">

                        <div v-for="column in boardColumns" :key="`summary-${column.id}`" class="flex
                                   items-center
                                   gap-2">

                            <span class="h-1.5
                                       w-1.5
                                       rounded-full" :class="column.color"></span>


                            <span class="text-[11px]
                                       text-slate-500">
                                {{ column.title }}
                            </span>


                            <span class="text-[11px]
                                       font-semibold
                                       text-slate-700">
                                {{ column.tasks.length }}
                            </span>

                        </div>

                    </div>

                </div>

            </section>

        </template>

    </main>

</template>