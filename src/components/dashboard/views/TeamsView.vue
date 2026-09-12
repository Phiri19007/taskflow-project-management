<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";

import TeamsHeader from "@/components/dashboard/views/sectionsHeaders/TeamsHeader.vue";

import { useProjectStore } from "@/services/stores/project.store";
import { useTaskStore } from "@/services/stores/task.store";
import { useWorkspaceStore } from "@/services/stores/workspace.store";
import { useWorkspaceMemberStore } from "@/services/stores/workspace-member.store";

import {
    Users,
    CheckSquare,
    Calendar,
} from "lucide-vue-next";


const projectStore = useProjectStore();
const taskStore = useTaskStore();
const workspaceStore = useWorkspaceStore();
const workspaceMemberStore = useWorkspaceMemberStore();


const projects = computed(() => projectStore.projects);


const projectMemberCounts = ref<Map<number, number>>(new Map());
const projectTaskCounts = ref<Map<number, number>>(new Map());


const loading = ref(false);


async function loadProjectStatistics() {
    const currentProjects = projects.value;

    if (!currentProjects.length || loading.value) {
        return;
    }

    loading.value = true;

    try {
        const workspace = workspaceStore.currentWorkspace;

        if (!workspace) {
            return;
        }

        /*
         * Load workspace members once.
         */
        if (!workspaceMemberStore.members.length) {
            await workspaceMemberStore.fetchMembers(workspace.id);
        }


        /*
         * Use fresh maps instead of mutating
         * the existing reactive maps.
         */
        const memberCounts = new Map<number, number>();
        const taskCounts = new Map<number, number>();


        /*
         * taskStore.tasks is shared, so requests
         * must remain sequential with the current
         * store implementation.
         */
        for (const project of currentProjects) {

            const memberIds = new Set<number>();


            /*
             * Project owner.
             */
            if (project.createdBy?.id) {
                memberIds.add(project.createdBy.id);
            }


            /*
             * Fetch project tasks.
             */
            try {
                await taskStore.fetchTasks(project.id);

                const projectTasks = [...taskStore.tasks];

                taskCounts.set(
                    project.id,
                    projectTasks.length
                );


                /*
                 * Task creators and assignees.
                 */
                for (const task of projectTasks) {

                    if (task.createdBy?.id) {
                        memberIds.add(task.createdBy.id);
                    }

                    if (task.assignedTo?.id) {
                        memberIds.add(task.assignedTo.id);
                    }
                }

            } catch (error) {

                console.error(
                    `Failed to load tasks for project ${project.id}:`,
                    error
                );

                taskCounts.set(project.id, 0);
            }


            /*
             * Match users against workspace members.
             */
            const memberCount =
                workspaceMemberStore.members.filter(
                    member =>
                        memberIds.has(member.user.id)
                ).length;


            memberCounts.set(
                project.id,
                memberCount
            );
        }


        projectMemberCounts.value = memberCounts;
        projectTaskCounts.value = taskCounts;

    } finally {
        loading.value = false;
    }
}


function getProjectMemberCount(projectId: number) {
    return projectMemberCounts.value.get(projectId) ?? 0;
}


function getProjectTaskCount(projectId: number) {
    return projectTaskCounts.value.get(projectId) ?? 0;
}


function formatDate(date: string | null) {
    if (!date) {
        return "No date";
    }

    return new Date(date).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
}


watch(
    () => [
        workspaceStore.currentWorkspace?.id,
        projectStore.projects.length,
    ],
    async () => {
        await loadProjectStatistics();
    },
    {
        immediate: true,
    }
);
</script>


<template>
<main class="min-h-full flex-1 overflow-y-auto bg-[#f4f7fa]">
    <div class="mx-auto w-full max-w-375 px-4 py-4 sm:px-5 lg:px-6">


        <TeamsHeader />


        <!-- Projects -->

        <div
            v-if="projects.length"
            class="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
                xl:grid-cols-3
            "
        >

            <RouterLink
                v-for="project in projects"
                :key="project.id"
                :to="{
                    name: 'project-home',
                    params: {
                        projectId: project.id,
                    },
                }"
                class="
                    flex
                    min-h-60
                    cursor-pointer
                    flex-col
                    justify-between
                    rounded-2xl
                    border
                    border-slate-100
                    bg-white
                    p-5
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-md
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                "
            >

                <div>

                    <!-- Status -->

                    <div
                        class="
                            mb-3
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <span
                            class="
                                rounded-md
                                bg-blue-50
                                px-2
                                py-0.5
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-blue-600
                            "
                        >
                            {{ project.status }}
                        </span>


                        <span
                            class="
                                h-2
                                w-2
                                rounded-full
                                bg-emerald-500
                            "
                        ></span>

                    </div>


                    <!-- Title -->

                    <h3
                        class="
                            text-[16px]
                            font-bold
                            tracking-tight
                            text-slate-800
                        "
                    >
                        {{ project.name }}
                    </h3>


                    <!-- Description -->

                    <p
                        class="
                            mt-1
                            line-clamp-2
                            text-[12px]
                            text-slate-400
                        "
                    >
                        {{
                            project.description ||
                            "No description provided."
                        }}
                    </p>


                    <!-- Metrics -->

                    <div
                        class="
                            my-4
                            grid
                            grid-cols-2
                            gap-4
                            border-t
                            border-slate-50
                            pt-3
                        "
                    >

                        <!-- Team -->

                        <div>

                            <p
                                class="
                                    text-[11px]
                                    font-medium
                                    uppercase
                                    text-slate-400
                                "
                            >
                                Team Members
                            </p>

                            <p
                                class="
                                    mt-1
                                    flex
                                    items-center
                                    gap-1.5
                                    text-[15px]
                                    font-bold
                                    text-slate-700
                                "
                            >
                                <Users
                                    class="h-3.5 w-3.5 text-slate-400"
                                />

                                {{ getProjectMemberCount(project.id) }}
                            </p>

                        </div>


                        <!-- Tasks -->

                        <div>

                            <p
                                class="
                                    text-[11px]
                                    font-medium
                                    uppercase
                                    text-slate-400
                                "
                            >
                                Tasks
                            </p>

                            <p
                                class="
                                    mt-1
                                    flex
                                    items-center
                                    gap-1.5
                                    text-[15px]
                                    font-bold
                                    text-slate-700
                                "
                            >
                                <CheckSquare
                                    class="h-3.5 w-3.5 text-slate-400"
                                />

                                {{ getProjectTaskCount(project.id) }}
                            </p>

                        </div>

                    </div>

                </div>


                <!-- Footer -->

                <div
                    class="
                        space-y-3
                        border-t
                        border-slate-100
                        pt-3
                    "
                >

                    <!-- Progress -->

                    <div>

                        <div
                            class="
                                mb-1
                                flex
                                justify-between
                            "
                        >

                            <span
                                class="
                                    text-[11px]
                                    font-medium
                                    text-slate-400
                                "
                            >
                                Completion Rate
                            </span>

                            <span
                                class="
                                    text-[11px]
                                    font-bold
                                    text-blue-600
                                "
                            >
                                0%
                            </span>

                        </div>


                        <div
                            class="
                                h-1.5
                                w-full
                                rounded-full
                                bg-slate-100
                            "
                        >
                            <div
                                class="
                                    h-1.5
                                    w-0
                                    rounded-full
                                    bg-blue-600
                                "
                            ></div>
                        </div>

                    </div>


                    <!-- Dates -->

                    <div
                        class="
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            bg-slate-50
                            px-3
                            py-2
                            text-[11px]
                            text-slate-400
                        "
                    >

                        <span
                            class="
                                flex
                                items-center
                                gap-1
                            "
                        >
                            <Calendar
                                class="h-3 w-3"
                            />

                            {{ formatDate(project.startDate) }}
                        </span>


                        <span>→</span>


                        <span>
                            {{ formatDate(project.endDate) }}
                        </span>

                    </div>

                </div>

            </RouterLink>

        </div>


        <!-- Empty State -->

        <!-- ================================================= -->
<!-- NO PROJECTS -->
<!-- ================================================= -->

<div
    v-else
    class="
        flex
        min-h-[60vh]
        items-center
        justify-center
    "
>
    <div
        class="
            w-full
            max-w-xl
            px-6
            py-12
            text-center
        "
    >

        <!-- Icon -->

        <div
            class="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-700
            "
        >
            <Users
                class="h-8 w-8"
            />
        </div>


        <!-- Workspace -->

        <p
            class="
                mt-6
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-slate-500
            "
        >
            {{ workspaceStore.currentWorkspace?.name }}
        </p>


        <!-- Title -->

        <h2
            class="
                mt-2
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-3xl
            "
        >
            Your team will appear here
        </h2>


        <!-- Main explanation -->

        <p
            class="
                mx-auto
                mt-3
                max-w-lg
                text-sm
                leading-6
                text-slate-500
            "
        >
            This workspace doesn't have any projects yet.
            Team members are automatically identified from
            people assigned to tasks within your projects.
            Until there are projects and assigned tasks,
            there is no team to display here.
        </p>


        <!-- How it works -->

        <div
            class="
                mx-auto
                mt-6
                max-w-lg
                rounded-xl
                border
                border-slate-200
                bg-white
                p-5
                text-left
                shadow-sm
            "
        >

            <p
                class="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-800
                "
            >
                How your team is built
            </p>


            <div
                class="
                    mt-4
                    space-y-3
                "
            >

                <!-- Step 1 -->

                <div
                    class="
                        flex
                        items-start
                        gap-3
                    "
                >

                    <div
                        class="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-900
                            text-[10px]
                            font-bold
                            text-white
                        "
                    >
                        1
                    </div>

                    <div>
                        <p
                            class="
                                text-xs
                                font-semibold
                                text-slate-800
                            "
                        >
                            Create a project
                        </p>

                        <p
                            class="
                                mt-0.5
                                text-[11px]
                                leading-5
                                text-slate-400
                            "
                        >
                            Start a project inside this workspace.
                        </p>
                    </div>

                </div>


                <!-- Step 2 -->

                <div
                    class="
                        flex
                        items-start
                        gap-3
                    "
                >

                    <div
                        class="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-900
                            text-[10px]
                            font-bold
                            text-white
                        "
                    >
                        2
                    </div>

                    <div>
                        <p
                            class="
                                text-xs
                                font-semibold
                                text-slate-800
                            "
                        >
                            Create tasks
                        </p>

                        <p
                            class="
                                mt-0.5
                                text-[11px]
                                leading-5
                                text-slate-400
                            "
                        >
                            Add the work that needs to be completed
                            within the project.
                        </p>
                    </div>

                </div>


                <!-- Step 3 -->

                <div
                    class="
                        flex
                        items-start
                        gap-3
                    "
                >

                    <div
                        class="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-900
                            text-[10px]
                            font-bold
                            text-white
                        "
                    >
                        3
                    </div>

                    <div>
                        <p
                            class="
                                text-xs
                                font-semibold
                                text-slate-800
                            "
                        >
                            Assign tasks to people
                        </p>

                        <p
                            class="
                                mt-0.5
                                text-[11px]
                                leading-5
                                text-slate-400
                            "
                        >
                            Assign tasks to the people who will
                            work on them.
                        </p>
                    </div>

                </div>


                <!-- Step 4 -->

                <div
                    class="
                        flex
                        items-start
                        gap-3
                    "
                >

                    <div
                        class="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-900
                            text-[10px]
                            font-bold
                            text-white
                        "
                    >
                        4
                    </div>

                    <div>
                        <p
                            class="
                                text-xs
                                font-semibold
                                text-slate-800
                            "
                        >
                            Build your team
                        </p>

                        <p
                            class="
                                mt-0.5
                                text-[11px]
                                leading-5
                                text-slate-400
                            "
                        >
                            People assigned to project tasks will
                            automatically appear in this team view.
                        </p>
                    </div>

                </div>

            </div>

        </div>


        <!-- Final message -->

        <p
            class="
                mt-5
                text-[11px]
                font-medium
                text-slate-400
            "
        >
            Create a project and assign tasks to start building
            your team.
        </p>

    </div>
</div>

</div>
    </main>
</template>
