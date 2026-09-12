<script setup lang="ts">

import {
    computed,
} from "vue";

import {
    useRoute,
    useRouter,
} from "vue-router";

import {
    useAuthStore,
} from "@/services/stores/auth.store";

import {
    useProjectStore,
} from "@/services/stores/project.store";

import {
    X,
    Calendar,
    FolderKanban,
    CircleCheck,
    Clock3,
    Flag,
    Settings,
} from "lucide-vue-next";

import type {
    Task,
} from "@/types/task";
import { ProjectStatus } from "@/types/project";


// =========================================================
// Stores / Router
// =========================================================

const authStore =
    useAuthStore();

const projectStore =
    useProjectStore();

const route =
    useRoute();

const router =
    useRouter();


// =========================================================
// Props
// =========================================================

const props = defineProps<{
    show: boolean;
    task: Task | null;
}>();


// =========================================================
// Events
// =========================================================

const emit = defineEmits<{
    close: [];
    manage: [
        task: Task,
        role: "owner" | "assignee"
    ];
}>();


// =========================================================
// Project ID from URL
// =========================================================
//
// URL:
// /project/3/calendar
//
// If your router is:
// /project/:projectId/calendar
//
// then:
// route.params.projectId === "3"
// =========================================================

const projectId = computed(() => {

    return Number(
        route.params.projectId
    );

});


// =========================================================
// Current project
// =========================================================

const currentProject = computed(() => {

    const id =
        projectId.value;

    return projectStore.projects.find(
        project =>
            project.id === id
    ) ?? projectStore.currentProject;

});

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
// Can Manage
// =========================================================
//
// User can manage when:
//
// 1. They are assigned to the task
//
// OR
//
// 2. They are the project owner
//
// Project owner comes from:
// project.createdBy.id
// =========================================================

const canManage = computed(() => {


    if (
        !props.task ||
        !authStore.user ||
        !currentProject.value ||
        !canCreateTask.value
    ) {



        return false;
    }


    const currentUserId =
        authStore.user.id;

    const assignedUserId =
        props.task.assignedTo?.id;

    const projectOwnerId =
        currentProject.value.createdBy?.id;


    const isAssignedUser =
        currentUserId === assignedUserId;

    const isProjectOwner =
        currentUserId === projectOwnerId;



    const result =
        isAssignedUser ||
        isProjectOwner;

    return result;

});

// =========================================================
// Status label
// =========================================================

const statusLabel = computed(() => {

    if (!props.task) {
        return "";
    }

    return props.task.status
        .replace("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );

});


// =========================================================
// Priority label
// =========================================================

const priorityLabel = computed(() => {

    if (!props.task) {
        return "";
    }

    return (
        props.task.priority.charAt(0) +
        props.task.priority
            .slice(1)
            .toLowerCase()
    );

});


// =========================================================
// Status classes
// =========================================================

const statusClasses = computed(() => {

    if (!props.task) {
        return "";
    }

    switch (props.task.status) {

        case "DONE":

            return "bg-emerald-50 text-emerald-700 border-emerald-100";

        case "IN_PROGRESS":

            return "bg-blue-50 text-blue-700 border-blue-100";

        case "REVIEW":

            return "bg-amber-50 text-amber-700 border-amber-100";

        case "TODO":

            return "bg-slate-100 text-slate-600 border-slate-200";

        default:

            return "bg-slate-100 text-slate-600 border-slate-200";

    }

});


// =========================================================
// Priority classes
// =========================================================

const priorityClasses = computed(() => {

    if (!props.task) {
        return "";
    }

    switch (props.task.priority) {

        case "CRITICAL":

            return "bg-red-50 text-red-700 border-red-100";

        case "HIGH":

            return "bg-orange-50 text-orange-700 border-orange-100";

        case "MEDIUM":

            return "bg-amber-50 text-amber-700 border-amber-100";

        case "LOW":

            return "bg-emerald-50 text-emerald-700 border-emerald-100";

        default:

            return "bg-slate-100 text-slate-600 border-slate-200";

    }

});


// =========================================================
// Date formatter
// =========================================================

const formatDate = (
    date: string | null | undefined,
) => {

    if (!date) {
        return "—";
    }

    const parsedDate =
        new Date(`${date}T00:00:00`);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(parsedDate);

};


// =========================================================
// Initials
// =========================================================

const getInitials = (
    name: string | undefined,
) => {

    if (!name) {
        return "—";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .map(
            part => part.charAt(0)
        )
        .slice(0, 2)
        .join("")
        .toUpperCase();

};


// =========================================================
// Close
// =========================================================

const close = () => {

    emit("close");

};


// =========================================================
// Manage
// =========================================================

const manage = () => {
    if (!props.task) {
        return;
    }

    const currentUserId =
        authStore.user?.id;

    const projectOwnerId =
        currentProject.value?.createdBy?.id;

    const role =
        currentUserId === projectOwnerId
            ? "owner"
            : "assignee";

    emit(
        "manage",
        props.task,
        role
    );
    close();
};



</script>


<template>

    <Teleport to="body">

        <Transition name="fade">

            <div
                v-if="show && task"
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

                <!-- Dialog -->

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

                    <!-- Header -->

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

                        <div class="min-w-0">

                            <div
                                class="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <span
                                    class="
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-slate-400
                                    "
                                >
                                    Task
                                </span>

                                <span
                                    class="
                                        text-[10px]
                                        font-medium
                                        text-slate-300
                                    "
                                >
                                    #{{ task.id }}
                                </span>

                            </div>


                            <h2
                                class="
                                    mt-1.5
                                    truncate
                                    text-lg
                                    font-bold
                                    text-slate-900
                                "
                            >
                                {{ task.title }}
                            </h2>


                            <p
                                v-if="task.project"
                                class="
                                    mt-1
                                    flex
                                    items-center
                                    gap-1.5
                                    text-xs
                                    text-slate-400
                                "
                            >

                                <FolderKanban
                                    class="h-3.5 w-3.5"
                                />

                                {{ task.project.name }}

                            </p>

                        </div>


                        <!-- Close X -->

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
                            aria-label="Close task details"
                            @click="close"
                        >

                            <X class="h-5 w-5" />

                        </button>

                    </div>


                    <!-- Content -->

                    <div
                        class="
                            max-h-[65vh]
                            overflow-y-auto
                            px-10
                            py-8
                        "
                    >

                        <!-- Description -->

                        <section>

                            <div
                                class="
                                    flex
                                    items-center
                                    justify-between
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
                                    Description
                                </h3>

                                <span
                                    class="
                                        text-[10px]
                                        text-slate-400
                                    "
                                >
                                    Task description
                                </span>

                            </div>


                            <p
                                v-if="task.description"
                                class="
                                    mt-3
                                    max-w-3xl
                                    whitespace-pre-wrap
                                    text-sm
                                    leading-6
                                    text-slate-600
                                "
                            >
                                {{ task.description }}
                            </p>


                            <p
                                v-else
                                class="
                                    mt-3
                                    text-sm
                                    italic
                                    text-slate-400
                                "
                            >
                                No description provided.
                            </p>

                        </section>


                        <!-- Task properties -->

                        <section
                            class="
                                mt-8
                                border-t
                                border-slate-100
                                pt-6
                            "
                        >

                            <div
                                class="
                                    grid
                                    grid-cols-1
                                    gap-y-6
                                    md:grid-cols-3
                                    md:gap-x-10
                                "
                            >

                                <!-- Status -->

                                <div>

                                    <p
                                        class="
                                            text-[10px]
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                        "
                                    >
                                        Status
                                    </p>

                                    <span
                                        class="
                                            mt-2
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-md
                                            border
                                            px-2.5
                                            py-1
                                            text-[10px]
                                            font-semibold
                                        "
                                        :class="statusClasses"
                                    >

                                        <CircleCheck
                                            v-if="task.status === 'DONE'"
                                            class="h-3 w-3"
                                        />

                                        <Clock3
                                            v-else
                                            class="h-3 w-3"
                                        />

                                        {{ statusLabel }}

                                    </span>

                                </div>


                                <!-- Priority -->

                                <div>

                                    <p
                                        class="
                                            text-[10px]
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                        "
                                    >
                                        Priority
                                    </p>

                                    <span
                                        class="
                                            mt-2
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-md
                                            border
                                            px-2.5
                                            py-1
                                            text-[10px]
                                            font-semibold
                                        "
                                        :class="priorityClasses"
                                    >

                                        <Flag
                                            class="h-3 w-3"
                                        />

                                        {{ priorityLabel }}

                                    </span>

                                </div>


                                <!-- Due date -->

                                <div>

                                    <p
                                        class="
                                            text-[10px]
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                        "
                                    >
                                        Due date
                                    </p>

                                    <div
                                        class="
                                            mt-2
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <Calendar
                                            class="
                                                h-4
                                                w-4
                                                text-slate-400
                                            "
                                        />

                                        <span
                                            class="
                                                text-xs
                                                font-medium
                                                text-slate-700
                                            "
                                        >
                                            {{
                                                formatDate(
                                                    task.dueDate
                                                )
                                            }}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </section>


                        <!-- People -->

                        <section
                            class="
                                mt-8
                                border-t
                                border-slate-100
                                pt-6
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
                                People
                            </h3>


                            <div
                                class="
                                    mt-5
                                    grid
                                    grid-cols-1
                                    gap-6
                                    md:grid-cols-2
                                "
                            >

                                <!-- Assigned -->

                                <div
                                    class="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <div
                                        class="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-slate-100
                                            text-[10px]
                                            font-semibold
                                            text-slate-600
                                        "
                                    >

                                        {{
                                            getInitials(
                                                task.assignedTo?.fullName
                                            )
                                        }}

                                    </div>


                                    <div class="min-w-0">

                                        <p
                                            class="
                                                text-[10px]
                                                text-slate-400
                                            "
                                        >
                                            Assigned to
                                        </p>


                                        <p
                                            class="
                                                mt-0.5
                                                truncate
                                                text-xs
                                                font-semibold
                                                text-slate-700
                                            "
                                        >
                                            {{
                                                task.assignedTo?.fullName
                                                    || "Unassigned"
                                            }}
                                        </p>

                                    </div>

                                </div>


                                <!-- Created by -->

                                <div
                                    class="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <div
                                        class="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-slate-100
                                            text-[10px]
                                            font-semibold
                                            text-slate-600
                                        "
                                    >

                                        {{
                                            getInitials(
                                                task.createdBy?.fullName
                                            )
                                        }}

                                    </div>


                                    <div class="min-w-0">

                                        <p
                                            class="
                                                text-[10px]
                                                text-slate-400
                                            "
                                        >
                                            Created by
                                        </p>


                                        <p
                                            class="
                                                mt-0.5
                                                truncate
                                                text-xs
                                                font-semibold
                                                text-slate-700
                                            "
                                        >
                                            {{
                                                task.createdBy?.fullName
                                                    || "Unknown"
                                            }}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </section>


                        <!-- Activity -->

                        <section
                            v-if="
                                task.createdAt ||
                                task.updatedAt
                            "
                            class="
                                mt-8
                                border-t
                                border-slate-100
                                pt-6
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
                                Activity
                            </h3>


                            <div
                                class="
                                    mt-4
                                    flex
                                    flex-wrap
                                    gap-x-8
                                    gap-y-3
                                "
                            >

                                <div
                                    v-if="task.createdAt"
                                    class="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <Calendar
                                        class="
                                            h-3.5
                                            w-3.5
                                            text-slate-400
                                        "
                                    />

                                    <span
                                        class="
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >
                                        Created
                                    </span>

                                    <span
                                        class="
                                            text-[10px]
                                            font-medium
                                            text-slate-600
                                        "
                                    >
                                        {{ formatDate(task.createdAt) }}
                                    </span>

                                </div>


                                <div
                                    v-if="task.updatedAt"
                                    class="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <Calendar
                                        class="
                                            h-3.5
                                            w-3.5
                                            text-slate-400
                                        "
                                    />

                                    <span
                                        class="
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >
                                        Updated
                                    </span>

                                    <span
                                        class="
                                            text-[10px]
                                            font-medium
                                            text-slate-600
                                        "
                                    >
                                        {{ formatDate(task.updatedAt) }}
                                    </span>

                                </div>

                            </div>

                        </section>

                    </div>


                    <!-- Footer -->

                    <div
                        class="
                            flex
                            justify-between
                            gap-3
                            border-t
                            border-slate-100
                            bg-slate-50
                            px-10
                            py-5
                        "
                    >

                        <!-- Manage -->

                        <button
                            v-if="canManage"
                            type="button"
                            class="
                                inline-flex
                                h-11
                                items-center
                                gap-2
                                rounded-lg
                                bg-slate-900
                                px-6
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:bg-slate-800
                                cursor-pointer
                            "
                            @click="manage"
                        >

                            <Settings
                                class="h-4 w-4"
                            />

                            Manage

                        </button>


                        <!-- Close -->

                        <button
                            type="button"
                            class="
                                h-11
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-6
                                text-sm
                                font-medium
                                text-slate-600
                                transition
                                hover:bg-slate-100
                                hover:text-slate-900
                                cursor-pointer
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
    transition:
        opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

</style>