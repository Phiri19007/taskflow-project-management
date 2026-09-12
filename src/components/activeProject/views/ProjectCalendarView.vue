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
    type CreateTaskData,
} from '@/types/task'


const route = useRoute()

const taskStore = useTaskStore()

const workspaceStore = useWorkspaceStore()

const appStore = useAppStore()
const toast = useToastStore();
const projectStore = useProjectStore()



const projectId = computed(() => {

    return Number(
        route.params.projectId
    )

})


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


const createProjectTaskOpen = ref(false)

// Task Details Dialog

const taskDetailsOpen = ref(false)

const selectedTask = ref<
    (typeof taskStore.tasks[number]) | null
>(null)


function openTaskDetails(
    task: typeof taskStore.tasks[number],
) {

    selectedTask.value = task

    taskDetailsOpen.value = true

}

// Task Update Dialog

const taskUpdateOpen = ref(false)

const taskToUpdate = ref<
    (typeof taskStore.tasks[number]) | null
>(null)

const taskUpdateRole = ref<
    "owner" | "assignee"
>("assignee")


function closeTaskDetails() {

    taskDetailsOpen.value = false

    selectedTask.value = null

}


function handleButtonAction() {

    createProjectTaskOpen.value = true

}

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

/*
 * The dialog emits the task creation payload, not
 * the complete Task object.
 *
 * We don't need the emitted object here because
 * the backend/store is the source of truth.
 */
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


// ============================================================
// Load Tasks
// ============================================================

const loading = ref(false)

const loadError = ref<string | null>(null)


async function loadTasks() {

    if (!projectId.value) {

        loadError.value =
            'Invalid project ID.'

        return

    }


    loading.value = true

    loadError.value = null


    try {

        /*
         * Make sure workspace is initialized.
         */
        if (!workspaceStore.currentWorkspace) {

            await appStore.initializeWorkspace()

        }


        /*
         * Load real tasks from API.
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
            'Failed to load project tasks.'

    } finally {

        loading.value = false

    }

}


onMounted(() => {

    loadTasks()

})


// ============================================================
// Current Month
// ============================================================

const currentDate = ref(
    new Date()
)


// ============================================================
// Calendar Helpers
// ============================================================

const monthName = computed(() => {

    return new Intl.DateTimeFormat(
        'en-US',
        {
            month: 'long',
            year: 'numeric',
        },
    ).format(
        currentDate.value
    )

})


const daysInMonth = computed(() => {

    return new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        0,
    ).getDate()

})


const firstDayOfMonth = computed(() => {

    return new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth(),
        1,
    ).getDay()

})


function formatKey(
    date: Date,
): string {

    const year =
        date.getFullYear()


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0')


    const day =
        String(
            date.getDate()
        ).padStart(2, '0')


    return `${year}-${month}-${day}`

}


// ============================================================
// Calendar Days
// ============================================================

const calendarDays = computed(() => {

    const days: Array<{
        date: number
        fullDate: string
        isCurrentMonth: boolean
    }> = []


    const year =
        currentDate.value.getFullYear()


    const month =
        currentDate.value.getMonth()


    /*
     * Previous month days.
     */
    const previousMonthDays =
        new Date(
            year,
            month,
            0,
        ).getDate()


    for (
        let i = firstDayOfMonth.value - 1;
        i >= 0;
        i--
    ) {

        const date =
            previousMonthDays - i


        const previousMonth =
            new Date(
                year,
                month - 1,
                date,
            )


        days.push({

            date,

            fullDate:
                formatKey(
                    previousMonth
                ),

            isCurrentMonth:
                false,

        })

    }


    /*
     * Current month days.
     */
    for (
        let date = 1;
        date <= daysInMonth.value;
        date++
    ) {

        const current =
            new Date(
                year,
                month,
                date,
            )


        days.push({

            date,

            fullDate:
                formatKey(
                    current
                ),

            isCurrentMonth:
                true,

        })

    }


    /*
     * Next month days.
     */
    const remainingDays =
        42 - days.length


    for (
        let date = 1;
        date <= remainingDays;
        date++
    ) {

        const nextMonth =
            new Date(
                year,
                month + 1,
                date,
            )


        days.push({

            date,

            fullDate:
                formatKey(
                    nextMonth
                ),

            isCurrentMonth:
                false,

        })

    }


    return days

})


// ============================================================
// Task Date Helpers
// ============================================================

function taskDate(
    dueDate: string | null | undefined,
): string | null {

    if (!dueDate) {
        return null
    }


    /*
     * If the API returns:
     *
     * 2026-08-18
     *
     * we can use it directly.
     *
     * If it returns an ISO datetime:
     *
     * 2026-08-18T00:00:00.000Z
     *
     * we only take the date portion.
     */
    return dueDate.slice(
        0,
        10,
    )

}


function tasksForDate(
    date: string,
) {

    return taskStore.tasks.filter(
        task =>
            taskDate(
                task.dueDate
            ) === date
    )

}


function isToday(
    date: string,
) {

    const today =
        new Date()


    return formatKey(
        today
    ) === date

}


// ============================================================
// Navigation
// ============================================================

function previousMonth() {

    currentDate.value =
        new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth() - 1,
            1,
        )

}


function nextMonth() {

    currentDate.value =
        new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth() + 1,
            1,
        )

}


function goToToday() {

    const today =
        new Date()


    currentDate.value =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
        )

}


// ============================================================
// Status Styling
// ============================================================

function statusClasses(
    status: TaskStatus,
) {

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


function statusLabel(
    status: TaskStatus,
) {

    switch (status) {

        case TaskStatus.InProgress:

            return 'In progress'


        case TaskStatus.Done:

            return 'Done'


        case TaskStatus.Review:

            return 'Review'


        case TaskStatus.Todo:

            return 'Todo'


        default:

            return status

    }

}


// ============================================================
// Priority Styling
// ============================================================

function priorityDot(
    priority: TaskPriority,
) {

    switch (priority) {

        case TaskPriority.Critical:

            return 'bg-red-500'


        case TaskPriority.High:

            return 'bg-red-400'


        case TaskPriority.Medium:

            return 'bg-amber-400'


        case TaskPriority.Low:

            return 'bg-slate-300'


        default:

            return 'bg-slate-300'

    }

}


// ============================================================
// Calendar Statistics
// ============================================================

const totalTasks = computed(() => {

    return taskStore.tasks.length

})


const todoTasks = computed(() => {

    return taskStore.tasks.filter(
        task =>
            task.status === TaskStatus.Todo
    ).length

})


const inProgressTasks = computed(() => {

    return taskStore.tasks.filter(
        task =>
            task.status === TaskStatus.InProgress
    ).length

})


const reviewTasks = computed(() => {

    return taskStore.tasks.filter(
        task =>
            task.status === TaskStatus.Review
    ).length

})


const completedTasks = computed(() => {

    return taskStore.tasks.filter(
        task =>
            task.status === TaskStatus.Done
    ).length

})

async function handleTaskUpdated() {

    closeTaskUpdate()

    /*
     * Reload tasks from the backend so the calendar
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

        <TaskDetailsDialog :show="taskDetailsOpen" :task="selectedTask" @close="closeTaskDetails" @manage="handleManageTask"/>


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
                    Project calendar
                </h2>


                <p class="mt-1
                           text-xs
                           text-slate-400">
                    View project tasks and deadlines across the calendar.
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
            @updated="handleTaskUpdated"  @deleted="handleTaskDeleted" />


        <!-- ================================================= -->
        <!-- Loading -->
        <!-- ================================================= -->

        <div v-if="loading" class="mb-5
                   rounded-xl
                   border
                   border-slate-100
                   bg-white
                   px-5
                   py-4
                   text-xs
                   text-slate-400">
            Loading project tasks...
        </div>


        <!-- ================================================= -->
        <!-- Error -->
        <!-- ================================================= -->

        <div v-if="loadError" class="mb-5
                   rounded-xl
                   border
                   border-red-100
                   bg-red-50
                   px-5
                   py-4
                   text-xs
                   text-red-600">
            {{ loadError }}
        </div>


        <!-- ================================================= -->
        <!-- Calendar -->
        <!-- ================================================= -->

        <section class="overflow-hidden
                   rounded-xl
                   border
                   border-slate-100
                   bg-white">


            <!-- ================================================= -->
            <!-- Calendar Header -->
            <!-- ================================================= -->

            <div class="flex
                       flex-col
                       gap-4
                       border-b
                       border-slate-100
                       px-5
                       py-4
                       sm:flex-row
                       sm:items-center
                       sm:justify-between">

                <div class="flex
                           items-center
                           gap-3">

                    <h3 class="text-sm
                               font-semibold
                               text-slate-900">
                        {{ monthName }}
                    </h3>


                    <button type="button" class="rounded-md
                               border
                               border-slate-200
                               px-2.5
                               py-1
                               text-[10px]
                               font-medium
                               text-slate-500
                               transition-colors
                               hover:bg-slate-50" @click="goToToday">
                        Today
                    </button>

                </div>


                <!-- Month Navigation -->

                <div class="flex
                           items-center
                           gap-1">

                    <button type="button" class="flex
                               h-8
                               w-8
                               items-center
                               justify-center
                               rounded-md
                               text-slate-400
                               transition-colors
                               hover:bg-slate-50
                               hover:text-slate-700" @click="previousMonth">
                        ‹
                    </button>


                    <button type="button" class="flex
                               h-8
                               w-8
                               items-center
                               justify-center
                               rounded-md
                               text-slate-400
                               transition-colors
                               hover:bg-slate-50
                               hover:text-slate-700" @click="nextMonth">
                        ›
                    </button>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- Week Header -->
            <!-- ================================================= -->

            <div class="grid
                       grid-cols-7
                       border-b
                       border-slate-100
                       bg-slate-50/50">

                <div v-for="day in [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat'
                ]" :key="day" class="px-3
                           py-2.5
                           text-center
                           text-[10px]
                           font-semibold
                           uppercase
                           tracking-wide
                           text-slate-400">
                    {{ day }}
                </div>

            </div>


            <!-- ================================================= -->
            <!-- Calendar Grid -->
            <!-- ================================================= -->

            <div class="grid
                       grid-cols-7">

                <div v-for="day in calendarDays" :key="day.fullDate" class="relative
                           min-h-32
                           border-b
                           border-r
                           border-slate-100
                           p-2" :class="[
                            !day.isCurrentMonth
                                ? 'bg-slate-50/40'
                                : 'bg-white'
                        ]">


                    <!-- Date -->

                    <div class="mb-2
                               flex
                               items-center
                               justify-between">

                        <span class="flex
                                   h-6
                                   w-6
                                   items-center
                                   justify-center
                                   rounded-full
                                   text-[10px]
                                   font-medium" :class="isToday(day.fullDate)
                                    ? 'bg-slate-900 text-white'
                                    : day.isCurrentMonth
                                        ? 'text-slate-600'
                                        : 'text-slate-300'
                                    ">
                            {{ day.date }}
                        </span>


                        <!-- Task count -->

                        <span v-if="
                            tasksForDate(
                                day.fullDate
                            ).length
                        " class="text-[9px]
                                   font-medium
                                   text-slate-300">
                            {{
                                tasksForDate(
                                    day.fullDate
                                ).length
                            }}
                        </span>

                    </div>


                    <!-- ================================================= -->
                    <!-- Tasks -->
                    <!-- ================================================= -->
                    <div class="space-y-1.5">

                        <div v-for="task in tasksForDate(day.fullDate)" :key="task.id" class="group
               cursor-pointer
               rounded-md
               border
               border-slate-100
               bg-white
               px-2
               py-1.5
               shadow-sm
               transition
               hover:border-slate-300
               hover:bg-slate-50
               hover:shadow" role="button" tabindex="0" @click="openTaskDetails(task)"
                            @keydown.enter="openTaskDetails(task)" @keydown.space.prevent="openTaskDetails(task)">

                            <!-- Task Title -->

                            <div class="flex
                    items-start
                    gap-1.5">

                                <span class="mt-1
                       h-1.5
                       w-1.5
                       shrink-0
                       rounded-full" :class="priorityDot(task.priority)"></span>


                                <p class="min-w-0
                       truncate
                       text-[10px]
                       font-medium
                       text-slate-700" :title="task.title">
                                    {{ task.title }}
                                </p>

                            </div>


                            <!-- Status -->

                            <div class="mt-1 pl-3">

                                <span class="inline-flex
                       rounded
                       px-1.5
                       py-0.5
                       text-[8px]
                       font-semibold" :class="statusClasses(task.status)">
                                    {{ statusLabel(task.status) }}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>


        <!-- ================================================= -->
        <!-- Calendar Summary -->
        <!-- ================================================= -->

        <section class="mt-5
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
                        Calendar summary
                    </h3>


                    <p class="mt-1
                               text-xs
                               text-slate-400">
                        Tasks currently scheduled for this project.
                    </p>

                </div>


                <!-- ================================================= -->
                <!-- Summary -->
                <!-- ================================================= -->

                <div class="flex
                           flex-wrap
                           items-center
                           gap-5">

                    <!-- Todo -->

                    <div class="flex
                               items-center
                               gap-2">

                        <span class="h-1.5
                                   w-1.5
                                   rounded-full
                                   bg-slate-300"></span>


                        <span class="text-[11px]
                                   text-slate-500">
                            Todo
                        </span>


                        <span class="text-[11px]
                                   font-semibold
                                   text-slate-700">
                            {{ todoTasks }}
                        </span>

                    </div>


                    <!-- In Progress -->

                    <div class="flex
                               items-center
                               gap-2">

                        <span class="h-1.5
                                   w-1.5
                                   rounded-full
                                   bg-blue-500"></span>


                        <span class="text-[11px]
                                   text-slate-500">
                            In progress
                        </span>


                        <span class="text-[11px]
                                   font-semibold
                                   text-slate-700">
                            {{ inProgressTasks }}
                        </span>

                    </div>


                    <!-- Review -->

                    <div class="flex
                               items-center
                               gap-2">

                        <span class="h-1.5
                                   w-1.5
                                   rounded-full
                                   bg-amber-500"></span>


                        <span class="text-[11px]
                                   text-slate-500">
                            Review
                        </span>


                        <span class="text-[11px]
                                   font-semibold
                                   text-slate-700">
                            {{ reviewTasks }}
                        </span>

                    </div>


                    <!-- Done -->

                    <div class="flex
                               items-center
                               gap-2">

                        <span class="h-1.5
                                   w-1.5
                                   rounded-full
                                   bg-emerald-500"></span>


                        <span class="text-[11px]
                                   text-slate-500">
                            Done
                        </span>


                        <span class="text-[11px]
                                   font-semibold
                                   text-slate-700">
                            {{ completedTasks }}
                        </span>

                    </div>


                    <!-- Total -->

                    <div class="border-l
                               border-slate-100
                               pl-5">

                        <span class="text-[11px]
                                   font-semibold
                                   text-slate-700">
                            {{ totalTasks }} total
                        </span>

                    </div>

                </div>

            </div>

        </section>


    </main>

</template>