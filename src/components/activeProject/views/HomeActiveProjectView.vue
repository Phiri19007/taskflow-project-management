<script setup lang="ts">

import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
    Users,
    X,
} from "lucide-vue-next";

import { useProjectStore } from "@/services/stores/project.store";
import { useTaskStore } from "@/services/stores/task.store";
import { useWorkspaceStore } from "@/services/stores/workspace.store";
import { useAppStore } from "@/services/stores/app.store";
import { TaskStatus } from "@/types/task";
import { useWorkspaceMemberStore } from "@/services/stores/workspace-member.store";
import { useNotificationStore } from "@/services/stores/notification.store";


const route = useRoute();


const projectStore = useProjectStore();
const taskStore = useTaskStore();
const workspaceStore = useWorkspaceStore();
const appStore = useAppStore();
const workspaceMemberStore = useWorkspaceMemberStore();
const notificationStore = useNotificationStore();
const showMembersDialog = ref(false);

/*
 * Current project
 */
const project = computed(() =>
    projectStore.currentProject
);

const projectActivity = computed(() =>
    notificationStore.projectActivity
);

const projectMembers = computed(() => {
    const currentProject = project.value;

    if (!currentProject) {
        return [];
    }

    const userIds = new Set<number>();

    /*
     * Project owner
     */
    if (currentProject.createdBy?.id) {
        userIds.add(currentProject.createdBy.id);
    }

    /*
     * Task creators and assignees
     */
    taskStore.tasks.forEach(task => {
        if (task.createdBy?.id) {
            userIds.add(task.createdBy.id);
        }

        if (task.assignedTo?.id) {
            userIds.add(task.assignedTo.id);
        }
    });

    /*
     * Convert workspace members into project members.
     */
    return workspaceMemberStore.members
        .filter(member =>
            userIds.has(member.user.id)
        )
        .map(member => ({
            id: member.user.id,
            name: member.user.fullName,

            isOwner:
                member.user.id === currentProject.createdBy?.id,
        }));
});


/*
 * Project tasks
 *
 * Tasks are loaded from the task store
 * using the current project ID.
 */
const tasks = computed(() =>
    taskStore.tasks
);


const projectMemberCount = computed(() =>
    projectMembers.value.length
);


/*
 * Total number of tasks
 */
const taskCount = computed(() =>
    tasks.value.length
);



/*
 * Number of completed tasks
 */
const completedTaskCount = computed(() =>
    tasks.value.filter(
        task => task.status === TaskStatus.Done
    ).length
);



/*
 * Task progress
 */
const taskProgress = computed(() => {

    if (taskCount.value === 0) {
        return 0;
    }


    return Math.round(
        (
            completedTaskCount.value /
            taskCount.value
        ) * 100
    );

});


const inProgressTaskCount = computed(() =>
    tasks.value.filter(
        task =>
            task.status === TaskStatus.InProgress ||
            task.status === TaskStatus.Review
    ).length
);


const todoTaskCount = computed(() =>
    tasks.value.filter(
        task => task.status === TaskStatus.Todo
    ).length
);



/*
 * Load project and project tasks
 */
onMounted(async () => {

    const projectId =
        Number(route.params.projectId);


    /*
     * Load workspace.
     */
    if (!workspaceStore.currentWorkspace) {

        await appStore.initializeWorkspace();

    }


    const workspace =
        workspaceStore.currentWorkspace;


    if (!workspace) {

        console.error(
            "Workspace not found"
        );

        return;

    }


    /*
     * Load workspace members.
     */
    await workspaceMemberStore.fetchMembers(
        workspace.id
    );


    /*
     * Load project.
     */
    await projectStore.fetchProject(
        workspace.id,
        projectId
    );


    /*
     * Load project tasks.
     */
    await taskStore.fetchTasks(
        projectId
    );

    await Promise.all([

        taskStore.fetchTasks(
            projectId
        ),

        notificationStore.fetchProjectActivity(
            projectId
        ),

    ]);

});



const projectDaysRemaining = computed(() => {

    const endDate = project.value?.endDate;

    if (!endDate) {
        return 0;
    }

    const end =
        new Date(endDate).getTime();

    if (Number.isNaN(end)) {
        return 0;
    }

    const now = Date.now();

    if (now >= end) {
        return 0;
    }

    return Math.ceil(
        (end - now) /
        (1000 * 60 * 60 * 24)
    );

});

const projectDateProgress = computed(() => {

    const startDate = project.value?.startDate;
    const endDate = project.value?.endDate;

    if (!startDate || !endDate) {
        return 0;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    // Invalid dates
    if (
        Number.isNaN(start) ||
        Number.isNaN(end)
    ) {
        return 0;
    }

    // Invalid timeline
    if (end <= start) {
        return 100;
    }

    // Project has not started
    if (now <= start) {
        return 0;
    }

    // Project has ended
    if (now >= end) {
        return 100;
    }

    const progress =
        ((now - start) / (end - start)) * 100;

    return Math.round(progress);

});

const projectHasTimeline = computed(() => {
    return !!(
        project.value?.startDate &&
        project.value?.endDate
    );
});



const formatDate = (
    date: string | Date | null | undefined
) => {

    if (!date) {
        return "—";
    }


    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(
        new Date(date)
    );

};

const formatActivityTime = (
    date: string
) => {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    ).format(
        new Date(date)
    );

};


</script>


<template>


    <!-- Project Overview -->


    <main class="py-7">



        <div class="mb-5">

            <h2 class="text-sm
                   font-semibold
                   text-slate-900">
                Overview
            </h2>

            <p class="mt-1
                   text-xs
                   text-slate-400">
                Track the current state and timeline of this project.
            </p>

        </div>


        <!-- ================================================= -->
        <!-- Statistics -->
        <!-- ================================================= -->

        <div class="grid
               grid-cols-2
               overflow-hidden
               rounded-xl
               border
               border-slate-100
               lg:grid-cols-4">

            <!-- Tasks -->

            <div class="bg-white
                   px-5
                   py-4
                   lg:border-r
                   lg:border-slate-100">

                <p class="text-xs
                       font-medium
                       text-slate-400">
                    Tasks
                </p>

                <div class="mt-2 flex items-baseline gap-2">
                    <!-- Tasks -->

                    <span class="text-2xl
           font-semibold
           tracking-tight
           text-slate-900">
                        {{ taskCount }}
                    </span>

                    <span class="text-[11px]
                           text-slate-400">
                        total
                    </span>

                </div>

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

                <div class="mt-2 flex items-baseline gap-2">

                    <!-- Completed -->

                    <span class="text-2xl
           font-semibold
           tracking-tight
           text-slate-900">
                        {{ completedTaskCount }}
                    </span>

                    <span class="text-[11px]
                           text-slate-400">
                        tasks
                    </span>

                </div>

            </div>


            <!-- Members -->

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
                    Members
                </p>

                <div class="mt-2 flex items-baseline gap-2">

                    <span class="text-2xl
                           font-semibold
                           tracking-tight
                           text-slate-900">
                        {{ projectMemberCount }}
                    </span>

                    <span class="text-[11px]
                           text-slate-400">
                        people
                    </span>

                </div>

            </div>


            <!-- Progress -->

            <div class="border-t
                   border-slate-100
                   bg-white
                   px-5
                   py-4
                   lg:border-t-0">

                <p class="text-xs
                       font-medium
                       text-slate-400">
                    Progress
                </p>

                <div class="mt-2 flex items-baseline gap-2">

                    <!-- Progress -->

                    <span class="text-2xl
           font-semibold
           tracking-tight
           text-slate-900">
                        {{ taskProgress }}%
                    </span>

                    <span class="text-[11px]
                           text-slate-400">
                        complete
                    </span>

                </div>

            </div>

        </div>


        <!-- ================================================= -->
        <!-- Project Timeline -->
        <!-- ================================================= -->

        <section class="mt-5
           rounded-xl
           border
           border-slate-100
           bg-white
           p-5">

            <!-- Header -->

            <div class="flex
               flex-col
               gap-5
               sm:flex-row
               sm:items-center
               sm:justify-between">

                <div>

                    <h3 class="text-sm
                       font-semibold
                       text-slate-900">
                        Project timeline
                    </h3>

                    <p class="mt-1
                       text-xs
                       text-slate-400">
                        Track progress between the project start and end dates.
                    </p>

                </div>


                <!-- Dates -->

                <div v-if="projectHasTimeline" class="flex
                   items-center
                   gap-5
                   text-right">

                    <!-- Start -->

                    <div>

                        <p class="text-[10px]
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400">
                            Start
                        </p>

                        <p class="mt-1
                           text-xs
                           font-medium
                           text-slate-700">
                            {{ formatDate(project?.startDate) }}
                        </p>

                    </div>


                    <!-- Divider -->

                    <div class="h-7
                       w-px
                       bg-slate-100"></div>


                    <!-- End -->

                    <div>

                        <p class="text-[10px]
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400">
                            End
                        </p>

                        <p class="mt-1
                           text-xs
                           font-medium
                           text-slate-700">
                            {{ formatDate(project?.endDate) }}
                        </p>

                    </div>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- Timeline -->
            <!-- ================================================= -->

            <div v-if="projectHasTimeline" class="mt-6">

                <!-- Progress Bar -->

                <div class="h-2
                   w-full
                   overflow-hidden
                   rounded-full
                   bg-slate-100">

                    <div class="h-full
                       rounded-full
                       bg-slate-900
                       transition-all
                       duration-500" :style="{
                        width: `${projectDateProgress}%`
                    }"></div>

                </div>


                <!-- Progress Information -->

                <div class="mt-2
                   flex
                   items-center
                   justify-between
                   gap-4">

                    <span class="text-[11px]
                       text-slate-400">

                        {{ projectDateProgress }}%
                        of timeline elapsed

                    </span>


                    <span class="text-[11px]
                       font-medium
                       text-slate-500">

                        {{ projectDaysRemaining }}
                        {{ projectDaysRemaining === 1 ? 'day' : 'days' }}
                        remaining

                    </span>

                </div>


                <!-- Project Status -->

                <div class="mt-4">

                    <!-- Not started -->

                    <div v-if="projectDateProgress === 0" class="flex
                       items-center
                       gap-2">

                        <span class="h-2
                           w-2
                           rounded-full
                           bg-slate-300"></span>

                        <span class="text-[11px]
                           text-slate-400">
                            Project has not started yet.
                        </span>

                    </div>


                    <!-- In progress -->

                    <div v-else-if="projectDateProgress < 100" class="flex
                       items-center
                       gap-2">

                        <span class="h-2
                           w-2
                           rounded-full
                           bg-blue-500"></span>

                        <span class="text-[11px]
                           text-slate-400">
                            Project is currently in progress.
                        </span>

                    </div>


                    <!-- Completed -->

                    <div v-else class="flex
                       items-center
                       gap-2">

                        <span class="h-2
                           w-2
                           rounded-full
                           bg-emerald-500"></span>

                        <span class="text-[11px]
                           text-slate-400">
                            Project timeline has ended.
                        </span>

                    </div>

                </div>

            </div>


            <!-- No Timeline -->


            <div v-else class="mt-6
               rounded-lg
               bg-slate-50
               px-4
               py-4">

                <div class="flex
                   items-center
                   gap-3">

                    <div class="flex
                       h-8
                       w-8
                       shrink-0
                       items-center
                       justify-center
                       rounded-full
                       bg-white
                       text-slate-400">

                        <span class="text-xs">
                            —
                        </span>

                    </div>


                    <div>

                        <p class="text-xs
                           font-medium
                           text-slate-600">
                            No timeline set
                        </p>

                        <p class="mt-0.5
                           text-[10px]
                           text-slate-400">
                            Add a start and end date to track project progress.
                        </p>

                    </div>

                </div>

            </div>

        </section>



        <!-- Lower Overview -->

        <div class="mt-5
           grid
           grid-cols-1
           gap-5
           lg:grid-cols-3">


            <!-- Task Progress -->


            <section class="rounded-xl
           border
           border-slate-100
           p-5
           lg:col-span-2">

                <div class="flex
               items-start
               justify-between">

                    <div>

                        <h3 class="text-sm
                       font-semibold
                       text-slate-900">
                            Task progress
                        </h3>

                        <p class="mt-1
                       text-xs
                       text-slate-400">
                            Overall completion of project tasks.
                        </p>

                    </div>


                    <span class="text-sm
                   font-semibold
                   text-slate-900">
                        {{ taskProgress }}%
                    </span>

                </div>


                <!-- Progress -->

                <div class="mt-5
               h-2
               w-full
               overflow-hidden
               rounded-full
               bg-slate-100">

                    <div class="h-full
                       rounded-full
                       bg-slate-900
                       transition-all" :style="{
                        width: `${taskProgress}%`
                    }"></div>

                </div>


                <div class="mt-3
               flex
               items-center
               justify-between
               text-[11px]
               text-slate-400">

                    <span>
                        {{ completedTaskCount }} completed
                    </span>

                    <span>
                        {{ taskCount }} total
                    </span>

                </div>


                <!-- Task Breakdown -->

                <div class="mt-6
               grid
               grid-cols-3
               gap-3">


                    <!-- Completed -->

                    <div class="rounded-lg
                   bg-slate-50
                   px-4
                   py-3">

                        <p class="text-[10px]
                       font-medium
                       uppercase
                       tracking-wide
                       text-slate-400">
                            Completed
                        </p>

                        <p class="mt-1
                       text-sm
                       font-semibold
                       text-slate-900">
                            {{ completedTaskCount }}
                        </p>

                    </div>


                    <!-- In Progress -->

                    <div class="rounded-lg
                   bg-slate-50
                   px-4
                   py-3">

                        <p class="text-[10px]
                       font-medium
                       uppercase
                       tracking-wide
                       text-slate-400">
                            In progress
                        </p>

                        <p class="mt-1
                       text-sm
                       font-semibold
                       text-slate-900">
                            {{ inProgressTaskCount }}
                        </p>

                    </div>


                    <!-- Todo -->

                    <div class="rounded-lg
                   bg-slate-50
                   px-4
                   py-3">

                        <p class="text-[10px]
                       font-medium
                       uppercase
                       tracking-wide
                       text-slate-400">
                            Todo
                        </p>

                        <p class="mt-1
                       text-sm
                       font-semibold
                       text-slate-900">
                            {{ todoTaskCount }}
                        </p>

                    </div>

                </div>

            </section>


     
            <!-- Members -->


            <section class="rounded-xl
           border
           border-slate-100
           p-5">

                <div class="flex
               items-start
               justify-between">

                    <div>

                        <h3 class="text-sm
                       font-semibold
                       text-slate-900">
                            Members
                        </h3>

                        <p class="mt-1
                       text-xs
                       text-slate-400">
                            People working on this project.
                        </p>

                    </div>


                    <!-- Member count -->

                    <span class="text-sm
                   font-semibold
                   text-slate-900">
                        {{ projectMemberCount }}
                    </span>

                </div>


                <!-- Project Members -->

                <div v-if="projectMembers.length > 0" class="mt-5 space-y-3">

                    <div v-for="member in projectMembers" :key="member.id" class="flex
                   items-center
                   gap-3">

                        <!-- Avatar -->

                        <div class="flex
                       h-8
                       w-8
                       shrink-0
                       items-center
                       justify-center
                       rounded-full
                       bg-slate-100
                       text-[11px]
                       font-semibold
                       text-slate-600">

                            {{ member.name.charAt(0).toUpperCase() }}

                        </div>


                        <!-- Member information -->

                        <div class="min-w-0 flex-1">

                            <div class="flex items-center gap-2">

                                <p class="truncate
                               text-xs
                               font-medium
                               text-slate-700">
                                    {{ member.name }}
                                </p>


                                <!-- Owner badge -->

                                <span v-if="member.isOwner" class="shrink-0
                               rounded-full
                               bg-slate-100
                               px-2
                               py-0.5
                               text-[9px]
                               font-medium
                               text-slate-500">
                                    Owner
                                </span>

                            </div>


                            <p class="mt-0.5
                           text-[10px]
                           text-slate-400">
                                {{ member.isOwner
                                    ? 'Project Owner'
                                    : 'Project Member'
                                }}
                            </p>

                        </div>

                    </div>

                </div>


                <!-- No members -->

                <div v-else class="mt-5
               rounded-lg
               bg-slate-50
               px-4
               py-5
               text-center">

                    <p class="text-xs
                   text-slate-400">
                        No project members yet.
                    </p>

                </div>


                <!-- View all -->

<button
    type="button"
    class="mt-5
           w-full
           rounded-lg
           border
           border-slate-200
           py-2
           text-xs
           font-medium
           text-slate-600
           transition-colors
           hover:bg-slate-50"
    @click="showMembersDialog = true"
>
    View all members
</button>

            </section>

        </div>

        <!-- Recent Activity -->
     

<section
    class="mt-5
           rounded-xl
           border
           border-slate-100
           p-5"
>

    <div>

        <h3
            class="text-sm
                   font-semibold
                   text-slate-900"
        >
            Recent activity
        </h3>

        <p
            class="mt-1
                   text-xs
                   text-slate-400"
        >
            Latest updates from this project.
        </p>

    </div>


    <!-- Activity -->

    <div
        v-if="projectActivity.length"
        class="mt-5
               divide-y
               divide-slate-100"
    >

        <div
            v-for="activity in projectActivity"
            :key="activity.id"
            class="flex
                   items-center
                   justify-between
                   gap-4
                   py-3"
        >

            <div
                class="flex
                       min-w-0
                       items-center
                       gap-3"
            >

                <!-- Activity indicator -->

                <div
                    class="h-2
                           w-2
                           shrink-0
                           rounded-full
                           bg-slate-300"
                ></div>


                <!-- Activity text -->

                <div class="min-w-0">

                    <p
                        class="truncate
                               text-xs
                               font-medium
                               text-slate-700"
                    >
                        {{ activity.title }}
                    </p>

                    <p
                        v-if="activity.message"
                        class="mt-0.5
                               truncate
                               text-[11px]
                               text-slate-400"
                    >
                        {{ activity.message }}
                    </p>

                </div>

            </div>


            <!-- Time -->

            <span
                class="shrink-0
                       text-[10px]
                       text-slate-400"
            >
                {{ formatActivityTime(activity.createdAt) }}
            </span>

        </div>

    </div>


    <!-- Empty state -->

    <div
        v-else
        class="mt-5
               rounded-lg
               bg-slate-50
               px-4
               py-6
               text-center"
    >

        <p
            class="text-xs
                   font-medium
                   text-slate-500"
        >
            No recent activity
        </p>

        <p
            class="mt-1
                   text-[11px]
                   text-slate-400"
        >
            Activity from this project will appear here.
        </p>

    </div>

</section>
<!-- ================================================= -->
<!-- Members Dialog -->
<!-- ================================================= -->

<Teleport to="body">

    <Transition name="fade">

        <div
            v-if="showMembersDialog"
            class="fixed
                   inset-0
                   z-50
                   flex
                   items-center
                   justify-center
                   bg-slate-950/40
                   p-5
                   backdrop-blur-sm"
            @click.self="showMembersDialog = false"
        >

            <div
                class="w-full
                       max-w-lg
                       overflow-hidden
                       rounded-xl
                       border
                       border-slate-200
                       bg-white
                       shadow-[0_25px_80px_-20px_rgba(15,23,42,0.25)]"
            >

                <!-- ================================================= -->
                <!-- Header -->
                <!-- ================================================= -->

                <div
                    class="flex
                           items-center
                           justify-between
                           border-b
                           border-slate-100
                           px-5
                           py-4"
                >

                    <div
                        class="flex
                               items-center
                               gap-3"
                    >

                        <div
                            class="flex
                                   h-9
                                   w-9
                                   items-center
                                   justify-center
                                   rounded-lg
                                   bg-slate-100"
                        >

                            <Users
                                class="h-4
                                       w-4
                                       text-slate-600"
                            />

                        </div>


                        <div>

                            <h2
                                class="text-sm
                                       font-semibold
                                       text-slate-900"
                            >
                                Project members
                            </h2>


                            <p
                                class="mt-0.5
                                       text-[11px]
                                       text-slate-400"
                            >
                                People working on this project.
                            </p>

                        </div>

                    </div>


                    <!-- Close -->

                    <button
                        type="button"
                        class="flex
                               h-8
                               w-8
                               items-center
                               justify-center
                               rounded-lg
                               text-slate-400
                               transition-colors
                               hover:bg-slate-100
                               hover:text-slate-600"
                        aria-label="Close members dialog"
                        @click="showMembersDialog = false"
                    >

                        <X
                            class="h-4
                                   w-4"
                        />

                    </button>

                </div>


                <!-- ================================================= -->
                <!-- Member count -->
                <!-- ================================================= -->

                <div
                    class="border-b
                           border-slate-100
                           bg-slate-50/50
                           px-5
                           py-3"
                >

                    <p
                        class="text-[11px]
                               text-slate-400"
                    >
                        <span
                            class="font-medium
                                   text-slate-600"
                        >
                            {{ projectMembers.length }}
                        </span>

                        {{
                            projectMembers.length === 1
                                ? "member"
                                : "members"
                        }}

                        on this project
                    </p>

                </div>


                <!-- ================================================= -->
                <!-- Members -->
                <!-- ================================================= -->

                <div
                    class="max-h-[55vh]
                           overflow-y-auto"
                >

                    <!-- Members exist -->

                    <div
                        v-if="projectMembers.length"
                        class="divide-y
                               divide-slate-100"
                    >

                        <div
                            v-for="member in projectMembers"
                            :key="member.id"
                            class="flex
                                   items-center
                                   gap-3
                                   px-5
                                   py-3.5"
                        >

                            <!-- Avatar -->

                            <div
                                class="flex
                                       h-9
                                       w-9
                                       shrink-0
                                       items-center
                                       justify-center
                                       rounded-full
                                       bg-slate-100
                                       text-[11px]
                                       font-semibold
                                       text-slate-600"
                            >

                                {{
                                    member.name
                                        .split(" ")
                                        .filter(Boolean)
                                        .map(
                                            name => name[0]
                                        )
                                        .slice(0, 2)
                                        .join("")
                                        .toUpperCase()
                                }}

                            </div>


                            <!-- Member -->

                            <div
                                class="min-w-0
                                       flex-1"
                            >

                                <p
                                    class="truncate
                                           text-xs
                                           font-medium
                                           text-slate-700"
                                >
                                    {{ member.name }}
                                </p>


                                <p
                                    class="mt-0.5
                                           text-[10px]
                                           text-slate-400"
                                >
                                    Project member
                                </p>

                            </div>


                            <!-- Role -->

                            <span
                                class="shrink-0
                                       rounded-full
                                       border
                                       px-2
                                       py-0.5
                                       text-[9px]
                                       font-medium"
                                :class="
                                    member.isOwner
                                        ? 'border-blue-100 bg-blue-50 text-blue-600'
                                        : 'border-slate-200 bg-slate-50 text-slate-500'
                                "
                            >

                                {{
                                    member.isOwner
                                        ? "Owner"
                                        : "Member"
                                }}

                            </span>

                        </div>

                    </div>


                    <!-- ================================================= -->
                    <!-- Empty -->
                    <!-- ================================================= -->

                    <div
                        v-else
                        class="px-5
                               py-10
                               text-center"
                    >

                        <div
                            class="mx-auto
                                   flex
                                   h-10
                                   w-10
                                   items-center
                                   justify-center
                                   rounded-full
                                   bg-slate-100"
                        >

                            <Users
                                class="h-4
                                       w-4
                                       text-slate-400"
                            />

                        </div>


                        <p
                            class="mt-3
                                   text-xs
                                   font-medium
                                   text-slate-600"
                        >
                            No project members
                        </p>


                        <p
                            class="mt-1
                                   text-[11px]
                                   text-slate-400"
                        >
                            Members will appear here when they are
                            assigned to this project.
                        </p>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- Footer -->
                <!-- ================================================= -->

                <div
                    class="border-t
                           border-slate-100
                           bg-slate-50/50
                           px-5
                           py-3"
                >

                    <button
                        type="button"
                        class="w-full
                               rounded-lg
                               border
                               border-slate-200
                               bg-white
                               py-2
                               text-xs
                               font-medium
                               text-slate-600
                               transition-colors
                               hover:bg-slate-50
                               hover:text-slate-900"
                        @click="showMembersDialog = false"
                    >
                        Done
                    </button>

                </div>

            </div>

        </div>

    </Transition>

</Teleport>

    </main>



</template>