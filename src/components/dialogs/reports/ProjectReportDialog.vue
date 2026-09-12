<script setup lang="ts">
import { computed, ref, watch } from "vue";

import {
    X,
    ArrowLeft,
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Clock3,
    Users,
    AlertTriangle,
    CalendarDays,
} from "lucide-vue-next";

import type {
    Project,
} from "@/types/project";

import {
    ProjectStatus,
} from "@/types/project";

import {
    TaskStatus,
    TaskPriority,
    type Task,
} from "@/types/task";

import {
    useTaskStore,
} from "@/services/stores/task.store";


const props = defineProps<{
    open: boolean;
    projects: Project[];
}>();


const emit = defineEmits<{
    close: [];
}>();


const taskStore =
    useTaskStore();


/*
 * Currently selected project.
 */
const selectedProject =
    ref<Project | null>(null);


/*
 * Tasks loaded specifically
 * for the project report.
 *
 * This is intentionally separate
 * from taskStore.tasks so the report
 * does not affect normal task state.
 */
const reportTasks =
    ref<Task[]>([]);


/*
 * Report loading state.
 */
const reportLoading =
    ref(false);


/*
 * Report error.
 */
const reportError =
    ref<string | null>(null);


/*
 * Only completed projects should
 * appear in the report dialog.
 */
const completedProjects =
    computed(() =>
        props.projects.filter(
            project =>
                project.status ===
                ProjectStatus.COMPLETED
        )
    );


/*
 * Close dialog.
 */
function close() {

    selectedProject.value = null;

    reportTasks.value = [];

    reportError.value = null;

    reportLoading.value = false;

    emit("close");
}


/*
 * Open a completed project report.
 *
 * Tasks are fetched separately from
 * the normal task store state.
 */
async function openProject(
    project: Project
) {

    selectedProject.value =
        project;

    reportTasks.value = [];

    reportError.value = null;

    reportLoading.value = true;


    try {

        reportTasks.value =
            await taskStore.fetchProjectReportTasks(
                project.id
            );

    } catch (error: any) {

        reportError.value =
            error?.message ||
            "Failed to load project report.";

    } finally {

        reportLoading.value = false;

    }
}


/*
 * Return to completed projects.
 */
function backToProjects() {

    selectedProject.value = null;

    reportTasks.value = [];

    reportError.value = null;

    reportLoading.value = false;
}


/*
 * Format project dates.
 */
function formatDate(
    date: string | null
) {

    if (!date) {
        return "Not set";
    }

    return new Date(
        date
    ).toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );
}


/*
 * =========================================================
 * REPORT DATA
 * =========================================================
 *
 * Everything below uses reportTasks rather than
 * taskStore.tasks.
 */


/*
 * Total tasks.
 */
const totalTasks = computed(() =>
    reportTasks.value.length
);


/*
 * Completed tasks.
 */
const completedTasks = computed(() =>
    reportTasks.value.filter(
        task =>
            task.status ===
            TaskStatus.Done
    ).length
);


/*
 * Remaining tasks.
 */
const remainingTasks = computed(() =>
    reportTasks.value.filter(
        task =>
            task.status !==
            TaskStatus.Done
    ).length
);


/*
 * Completion percentage.
 *
 * A completed project with no tasks
 * is treated as 100% complete.
 */
const completionPercentage =
    computed(() => {

        if (!totalTasks.value) {
            return 100;
        }

        return Math.round(
            (
                completedTasks.value /
                totalTasks.value
            ) * 100
        );
    });


/*
 * Count tasks by status.
 */
function countStatus(
    status: TaskStatus
) {

    return reportTasks.value.filter(
        task =>
            task.status === status
    ).length;
}


/*
 * Count tasks by priority.
 */
function countPriority(
    priority: TaskPriority
) {

    return reportTasks.value.filter(
        task =>
            task.priority === priority
    ).length;
}


/*
 * Team contribution.
 *
 * Groups assigned tasks by user.
 */
const teamMembers =
    computed(() => {

        const members = new Map<
            number,
            {
                userId: number;
                name: string;
                tasks: number;
            }
        >();


        reportTasks.value.forEach(
            task => {

                if (!task.assignedTo) {
                    return;
                }


                const user =
                    task.assignedTo;


                const existing =
                    members.get(user.id);


                if (existing) {

                    existing.tasks++;

                } else {

                    members.set(
                        user.id,
                        {
                            userId: user.id,
                            name: user.fullName,
                            tasks: 1,
                        }
                    );

                }

            }
        );


        return Array.from(
            members.values()
        ).sort(
            (a, b) =>
                b.tasks - a.tasks
        );

    });


/*
 * Overdue tasks.
 *
 * Since this is a completed project report,
 * this is mainly useful for identifying tasks
 * that were not completed before their due date.
 */
const overdueTasks =
    computed(() => {

        const now =
            new Date();

        return reportTasks.value.filter(
            task => {

                if (!task.dueDate) {
                    return false;
                }

                if (
                    task.status ===
                    TaskStatus.Done
                ) {
                    return false;
                }

                return new Date(
                    task.dueDate
                ) < now;

            }
        );

    });


/*
 * Reset report state when dialog closes.
 */
watch(
    () => props.open,
    open => {

        if (!open) {

            selectedProject.value =
                null;

            reportTasks.value = [];

            reportError.value = null;

            reportLoading.value = false;

        }

    }
);
</script>


<template>

    <Teleport to="body">

        <Transition name="fade">

            <div
                v-if="props.open"
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
                @click.self="close"
            >

                <div
                    class="
                        w-full
                        max-w-5xl
                        overflow-hidden
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
                    "
                >

                    <!-- HEADER -->

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
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-green-50
                                    text-green-600
                                "
                            >

                                <BarChart3
                                    class="h-5 w-5"
                                />

                            </div>


                            <div>

                                <span
                                    class="
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-slate-400
                                    "
                                >
                                    {{
                                        selectedProject
                                            ? "Completed Project"
                                            : "Project Reports"
                                    }}
                                </span>


                                <h2
                                    class="
                                        mt-1
                                        text-lg
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    {{
                                        selectedProject
                                            ? selectedProject.name
                                            : "Completed Projects"
                                    }}
                                </h2>

                            </div>

                        </div>


                        <button
                            type="button"
                            class="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-slate-100
                                hover:text-slate-700
                            "
                            aria-label="Close reports"
                            @click="close"
                        >

                            <X class="h-5 w-5" />

                        </button>

                    </div>


                    <!-- CONTENT -->

                    <div
                        class="
                            max-h-[70vh]
                            min-h-115
                            overflow-y-auto
                            px-10
                            py-8
                        "
                    >

                        <!-- ================================= -->
                        <!-- PROJECT REPORT -->
                        <!-- ================================= -->

                        <template
                            v-if="selectedProject"
                        >

                            <!-- Back -->

                            <button
                                type="button"
                                class="
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-medium
                                    text-slate-500
                                    transition
                                    hover:text-blue-600
                                "
                                @click="backToProjects"
                            >

                                <ArrowLeft
                                    class="h-3.5 w-3.5"
                                />

                                Back to completed projects

                            </button>


                            <!-- Project heading -->

                            <div class="mt-6">

                                <div
                                    class="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <CheckCircle2
                                        class="
                                            h-4
                                            w-4
                                            text-green-600
                                        "
                                    />

                                    <span
                                        class="
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-wider
                                            text-green-600
                                        "
                                    >
                                        Project Completed
                                    </span>

                                </div>


                                <h3
                                    class="
                                        mt-3
                                        text-2xl
                                        font-bold
                                        tracking-tight
                                        text-slate-900
                                    "
                                >
                                    {{ selectedProject.name }}
                                </h3>


                                <p
                                    v-if="
                                        selectedProject.description
                                    "
                                    class="
                                        mt-2
                                        max-w-3xl
                                        text-sm
                                        leading-6
                                        text-slate-500
                                    "
                                >
                                    {{
                                        selectedProject.description
                                    }}
                                </p>

                            </div>


                            <!-- ================================= -->
                            <!-- LOADING -->
                            <!-- ================================= -->

                            <div
                                v-if="reportLoading"
                                class="
                                    mt-10
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-6
                                    py-16
                                    text-center
                                "
                            >

                                <div
                                    class="
                                        h-8
                                        w-8
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-slate-200
                                        border-t-green-600
                                    "
                                ></div>


                                <p
                                    class="
                                        mt-4
                                        text-sm
                                        font-medium
                                        text-slate-600
                                    "
                                >
                                    Loading project report...
                                </p>


                                <p
                                    class="
                                        mt-1
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Gathering project task information.
                                </p>

                            </div>


                            <!-- ================================= -->
                            <!-- ERROR -->
                            <!-- ================================= -->

                            <div
                                v-else-if="reportError"
                                class="
                                    mt-8
                                    rounded-lg
                                    border
                                    border-red-100
                                    bg-red-50
                                    px-5
                                    py-5
                                "
                            >

                                <div
                                    class="
                                        flex
                                        items-start
                                        gap-3
                                    "
                                >

                                    <AlertTriangle
                                        class="
                                            mt-0.5
                                            h-5
                                            w-5
                                            shrink-0
                                            text-red-500
                                        "
                                    />


                                    <div>

                                        <p
                                            class="
                                                text-sm
                                                font-semibold
                                                text-red-800
                                            "
                                        >
                                            Unable to load report
                                        </p>


                                        <p
                                            class="
                                                mt-1
                                                text-xs
                                                leading-5
                                                text-red-600
                                            "
                                        >
                                            {{ reportError }}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <!-- ================================= -->
                            <!-- REPORT DATA -->
                            <!-- ================================= -->

                            <template
                                v-else
                            >

                                <!-- ================================= -->
                                <!-- SUMMARY -->
                                <!-- ================================= -->

                                <section class="mt-8">

                                    <div
                                        class="
                                            grid
                                            grid-cols-2
                                            gap-3
                                            md:grid-cols-4
                                        "
                                    >

                                        <!-- Completion -->

                                        <div
                                            class="
                                                rounded-lg
                                                border
                                                border-green-100
                                                bg-green-50
                                                p-4
                                            "
                                        >

                                            <span
                                                class="
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-green-600
                                                "
                                            >
                                                Completion
                                            </span>


                                            <p
                                                class="
                                                    mt-2
                                                    text-2xl
                                                    font-bold
                                                    text-green-700
                                                "
                                            >
                                                {{ completionPercentage }}%
                                            </p>

                                        </div>


                                        <!-- Total -->

                                        <div
                                            class="
                                                rounded-lg
                                                border
                                                border-slate-200
                                                bg-white
                                                p-4
                                            "
                                        >

                                            <span
                                                class="
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-slate-400
                                                "
                                            >
                                                Total Tasks
                                            </span>


                                            <p
                                                class="
                                                    mt-2
                                                    text-2xl
                                                    font-bold
                                                    text-slate-900
                                                "
                                            >
                                                {{ totalTasks }}
                                            </p>

                                        </div>


                                        <!-- Completed -->

                                        <div
                                            class="
                                                rounded-lg
                                                border
                                                border-green-100
                                                bg-white
                                                p-4
                                            "
                                        >

                                            <span
                                                class="
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-slate-400
                                                "
                                            >
                                                Completed
                                            </span>


                                            <p
                                                class="
                                                    mt-2
                                                    text-2xl
                                                    font-bold
                                                    text-green-600
                                                "
                                            >
                                                {{ completedTasks }}
                                            </p>

                                        </div>


                                        <!-- Remaining -->

                                        <div
                                            class="
                                                rounded-lg
                                                border
                                                border-slate-200
                                                bg-white
                                                p-4
                                            "
                                        >

                                            <span
                                                class="
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-slate-400
                                                "
                                            >
                                                Remaining
                                            </span>


                                            <p
                                                class="
                                                    mt-2
                                                    text-2xl
                                                    font-bold
                                                    text-slate-900
                                                "
                                            >
                                                {{ remainingTasks }}
                                            </p>

                                        </div>

                                    </div>

                                </section>


                                <!-- ================================= -->
                                <!-- DATES -->
                                <!-- ================================= -->

                                <section
                                    class="
                                        mt-8
                                        border-t
                                        border-slate-100
                                        pt-7
                                    "
                                >

                                    <h3
                                        class="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-600
                                        "
                                    >
                                        Project Timeline
                                    </h3>


                                    <div
                                        class="
                                            mt-5
                                            grid
                                            grid-cols-1
                                            gap-3
                                            md:grid-cols-2
                                        "
                                    >

                                        <!-- Started -->

                                        <div
                                            class="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-lg
                                                border
                                                border-slate-100
                                                bg-slate-50
                                                px-4
                                                py-3
                                            "
                                        >

                                            <CalendarDays
                                                class="
                                                    h-5
                                                    w-5
                                                    text-slate-400
                                                "
                                            />


                                            <div>

                                                <p
                                                    class="
                                                        text-[10px]
                                                        font-semibold
                                                        uppercase
                                                        tracking-wide
                                                        text-slate-400
                                                    "
                                                >
                                                    Started
                                                </p>


                                                <p
                                                    class="
                                                        mt-1
                                                        text-sm
                                                        font-medium
                                                        text-slate-700
                                                    "
                                                >
                                                    {{
                                                        formatDate(
                                                            selectedProject.startDate
                                                        )
                                                    }}
                                                </p>

                                            </div>

                                        </div>


                                        <!-- Completed -->

                                        <div
                                            class="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-lg
                                                border
                                                border-green-100
                                                bg-green-50
                                                px-4
                                                py-3
                                            "
                                        >

                                            <CheckCircle2
                                                class="
                                                    h-5
                                                    w-5
                                                    text-green-600
                                                "
                                            />


                                            <div>

                                                <p
                                                    class="
                                                        text-[10px]
                                                        font-semibold
                                                        uppercase
                                                        tracking-wide
                                                        text-green-600
                                                    "
                                                >
                                                    Completed
                                                </p>


                                                <p
                                                    class="
                                                        mt-1
                                                        text-sm
                                                        font-medium
                                                        text-slate-700
                                                    "
                                                >
                                                    {{
                                                        formatDate(
                                                            selectedProject.endDate
                                                        )
                                                    }}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </section>


                                <!-- ================================= -->
                                <!-- TASK STATUS -->
                                <!-- ================================= -->

                                <section
                                    class="
                                        mt-8
                                        border-t
                                        border-slate-100
                                        pt-7
                                    "
                                >

                                    <h3
                                        class="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-600
                                        "
                                    >
                                        Task Summary
                                    </h3>


                                    <div
                                        class="
                                            mt-5
                                            grid
                                            grid-cols-2
                                            gap-3
                                            md:grid-cols-4
                                        "
                                    >

                                        <!-- Done -->

                                        <div
                                            class="
                                                rounded-lg
                                                border
                                                border-green-100
                                                bg-green-50
                                                p-4
                                            "
                                        >

                                            <CheckCircle2
                                                class="
                                                    h-4
                                                    w-4
                                                    text-green-600
                                                "
                                            />


                                            <p
                                                class="
                                                    mt-3
                                                    text-xl
                                                    font-bold
                                                    text-slate-900
                                                "
                                            >
                                                {{
                                                    countStatus(
                                                        TaskStatus.Done
                                                    )
                                                }}
                                            </p>


                                            <p
                                                class="
                                                    text-xs
                                                    text-slate-500
                                                "
                                            >
                                                Done
                                            </p>

                                        </div>


                                        <!-- In Progress -->

                                        <div
                                            class="
                                                rounded-lg
                                                border
                                                border-blue-100
                                                bg-blue-50
                                                p-4
                                            "
                                        >

                                            <Clock3
                                                class="
                                                    h-4
                                                    w-4
                                                    text-blue-600
                                                "
                                            />


                                            <p
                                                class="
                                                    mt-3
                                                    text-xl
                                                    font-bold
                                                    text-slate-900
                                                "
                                            >
                                                {{
                                                    countStatus(
                                                        TaskStatus.InProgress
                                                    )
                                                }}
                                            </p>


                                            <p
                                                class="
                                                    text-xs
                                                    text-slate-500
                                                "
                                            >
                                                In Progress
                                            </p>

                                        </div>


                                        <!-- Review -->

                                        <div
                                            class="
                                                rounded-lg
                                                border
                                                border-yellow-100
                                                bg-yellow-50
                                                p-4
                                            "
                                        >

                                            <Clock3
                                                class="
                                                    h-4
                                                    w-4
                                                    text-yellow-600
                                                "
                                            />


                                            <p
                                                class="
                                                    mt-3
                                                    text-xl
                                                    font-bold
                                                    text-slate-900
                                                "
                                            >
                                                {{
                                                    countStatus(
                                                        TaskStatus.Review
                                                    )
                                                }}
                                            </p>


                                            <p
                                                class="
                                                    text-xs
                                                    text-slate-500
                                                "
                                            >
                                                Review
                                            </p>

                                        </div>


                                        <!-- Todo -->

                                        <div
                                            class="
                                                rounded-lg
                                                border
                                                border-slate-200
                                                bg-slate-50
                                                p-4
                                            "
                                        >

                                            <p
                                                class="
                                                    text-[10px]
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-slate-400
                                                "
                                            >
                                                To Do
                                            </p>


                                            <p
                                                class="
                                                    mt-3
                                                    text-xl
                                                    font-bold
                                                    text-slate-900
                                                "
                                            >
                                                {{
                                                    countStatus(
                                                        TaskStatus.Todo
                                                    )
                                                }}
                                            </p>

                                        </div>

                                    </div>

                                </section>


                                <!-- ================================= -->
                                <!-- PRIORITY -->
                                <!-- ================================= -->

                                <section
                                    class="
                                        mt-8
                                        border-t
                                        border-slate-100
                                        pt-7
                                    "
                                >

                                    <h3
                                        class="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-600
                                        "
                                    >
                                        Task Priority
                                    </h3>


                                    <div
                                        class="
                                            mt-5
                                            divide-y
                                            divide-slate-100
                                            rounded-lg
                                            border
                                            border-slate-200
                                        "
                                    >

                                        <div
                                            v-for="priority in [
                                                TaskPriority.Critical,
                                                TaskPriority.High,
                                                TaskPriority.Medium,
                                                TaskPriority.Low,
                                            ]"
                                            :key="priority"
                                            class="
                                                flex
                                                items-center
                                                justify-between
                                                px-4
                                                py-3
                                            "
                                        >

                                            <span
                                                class="
                                                    text-sm
                                                    text-slate-600
                                                "
                                            >
                                                {{ priority }}
                                            </span>


                                            <span
                                                class="
                                                    text-sm
                                                    font-semibold
                                                    text-slate-900
                                                "
                                            >
                                                {{
                                                    countPriority(
                                                        priority
                                                    )
                                                }}
                                            </span>

                                        </div>

                                    </div>

                                </section>


                                <!-- ================================= -->
                                <!-- TEAM -->
                                <!-- ================================= -->

                                <section
                                    class="
                                        mt-8
                                        border-t
                                        border-slate-100
                                        pt-7
                                    "
                                >

                                    <div
                                        class="
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <Users
                                            class="
                                                h-4
                                                w-4
                                                text-slate-400
                                            "
                                        />


                                        <h3
                                            class="
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-slate-600
                                            "
                                        >
                                            Team Contribution
                                        </h3>

                                    </div>


                                    <div
                                        v-if="
                                            teamMembers.length
                                        "
                                        class="
                                            mt-5
                                            divide-y
                                            divide-slate-100
                                            rounded-lg
                                            border
                                            border-slate-200
                                        "
                                    >

                                        <div
                                            v-for="
                                                member in teamMembers
                                            "
                                            :key="member.userId"
                                            class="
                                                flex
                                                items-center
                                                justify-between
                                                px-4
                                                py-3
                                            "
                                        >

                                            <span
                                                class="
                                                    text-sm
                                                    font-medium
                                                    text-slate-700
                                                "
                                            >
                                                {{ member.name }}
                                            </span>


                                            <span
                                                class="
                                                    text-xs
                                                    text-slate-400
                                                "
                                            >
                                                {{ member.tasks }}
                                                tasks
                                            </span>

                                        </div>

                                    </div>


                                    <p
                                        v-else
                                        class="
                                            mt-4
                                            text-sm
                                            text-slate-400
                                        "
                                    >
                                        No assigned team members.
                                    </p>

                                </section>


                                <!-- ================================= -->
                                <!-- FINAL MESSAGE -->
                                <!-- ================================= -->

                                <div
                                    class="
                                        mt-8
                                        flex
                                        items-center
                                        gap-3
                                        rounded-lg
                                        border
                                        border-green-100
                                        bg-green-50
                                        px-4
                                        py-3
                                    "
                                >

                                    <CheckCircle2
                                        class="
                                            h-5
                                            w-5
                                            shrink-0
                                            text-green-600
                                        "
                                    />


                                    <div>

                                        <p
                                            class="
                                                text-xs
                                                font-semibold
                                                text-green-800
                                            "
                                        >
                                            Project completed
                                        </p>


                                        <p
                                            class="
                                                mt-0.5
                                                text-[11px]
                                                text-green-600
                                            "
                                        >
                                            This report summarizes the
                                            final project status and
                                            completed work.
                                        </p>

                                    </div>

                                </div>

                            </template>

                        </template>


                        <!-- ================================= -->
                        <!-- COMPLETED PROJECT LIST -->
                        <!-- ================================= -->

                        <template v-else>

                            <section>

                                <div
                                    class="
                                        flex
                                        items-end
                                        justify-between
                                    "
                                >

                                    <div>

                                        <h3
                                            class="
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-slate-600
                                            "
                                        >
                                            Completed Projects
                                        </h3>


                                        <p
                                            class="
                                                mt-1
                                                text-xs
                                                text-slate-400
                                            "
                                        >
                                            Select a completed project
                                            to review its report.
                                        </p>

                                    </div>


                                    <span
                                        class="
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >
                                        {{
                                            completedProjects.length
                                        }}
                                        projects
                                    </span>

                                </div>


                                <!-- PROJECTS -->

                                <div
                                    v-if="
                                        completedProjects.length
                                    "
                                    class="
                                        mt-5
                                        grid
                                        grid-cols-1
                                        gap-3
                                        md:grid-cols-2
                                    "
                                >

                                    <button
                                        v-for="
                                            project in completedProjects
                                        "
                                        :key="project.id"
                                        type="button"
                                        class="
                                            group
                                            flex
                                            min-h-24
                                            items-center
                                            justify-between
                                            gap-5
                                            rounded-lg
                                            border
                                            border-slate-200
                                            bg-white
                                            px-5
                                            py-4
                                            text-left
                                            transition
                                            hover:border-green-200
                                            hover:bg-green-50/40
                                            hover:shadow-sm
                                        "
                                        @click="
                                            openProject(project)
                                        "
                                    >

                                        <div>

                                            <div
                                                class="
                                                    flex
                                                    items-center
                                                    gap-2
                                                "
                                            >

                                                <CheckCircle2
                                                    class="
                                                        h-4
                                                        w-4
                                                        shrink-0
                                                        text-green-500
                                                    "
                                                />


                                                <span
                                                    class="
                                                        text-sm
                                                        font-semibold
                                                        text-slate-700
                                                        transition
                                                        group-hover:text-green-600
                                                    "
                                                >
                                                    {{
                                                        project.name
                                                    }}
                                                </span>

                                            </div>


                                            <p
                                                class="
                                                    mt-2
                                                    text-xs
                                                    text-slate-400
                                                "
                                            >
                                                Completed
                                                {{
                                                    formatDate(
                                                        project.endDate
                                                    )
                                                }}
                                            </p>

                                        </div>


                                        <ArrowRight
                                            class="
                                                h-4
                                                w-4
                                                shrink-0
                                                text-slate-300
                                                transition
                                                group-hover:translate-x-0.5
                                                group-hover:text-green-500
                                            "
                                        />

                                    </button>

                                </div>


                                <!-- EMPTY STATE -->

                                <div
                                    v-else
                                    class="
                                        mt-8
                                        flex
                                        flex-col
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-dashed
                                        border-slate-200
                                        px-6
                                        py-12
                                        text-center
                                    "
                                >

                                    <CheckCircle2
                                        class="
                                            h-8
                                            w-8
                                            text-slate-300
                                        "
                                    />


                                    <p
                                        class="
                                            mt-3
                                            text-sm
                                            font-medium
                                            text-slate-600
                                        "
                                    >
                                        No completed projects
                                    </p>


                                    <p
                                        class="
                                            mt-1
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Reports will appear here
                                        once a project is completed.
                                    </p>

                                </div>

                            </section>

                        </template>

                    </div>


                    <!-- FOOTER -->

                    <div
                        class="
                            flex
                            justify-between
                            border-t
                            border-slate-100
                            bg-slate-50
                            px-10
                            py-4
                        "
                    >

                        <button
                            v-if="selectedProject"
                            type="button"
                            class="
                                inline-flex
                                h-10
                                items-center
                                gap-2
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
                                hover:text-slate-900
                            "
                            @click="backToProjects"
                        >

                            <ArrowLeft
                                class="h-4 w-4"
                            />

                            Back

                        </button>


                        <div v-else></div>


                        <button
                            type="button"
                            class="
                                h-10
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
                                hover:text-slate-900
                            "
                            @click="close"
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

        </Transition>

    </Teleport>

</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>