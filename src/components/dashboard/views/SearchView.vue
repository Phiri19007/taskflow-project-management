<script setup lang="ts">
import {
    computed,
} from "vue";

import {
    useRoute,
    useRouter,
} from "vue-router";

import {
    FolderKanban,
    CheckSquare,
    User,
    Search,
} from "lucide-vue-next";

import { useProjectStore } from "@/services/stores/project.store";
import { useTaskStore } from "@/services/stores/task.store";
import { useWorkspaceMemberStore } from "@/services/stores/workspace-member.store";


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const route = useRoute();
const router = useRouter();


/*
|--------------------------------------------------------------------------
| Stores
|--------------------------------------------------------------------------
*/

const projectStore =
    useProjectStore();

const taskStore =
    useTaskStore();

const workspaceMemberStore =
    useWorkspaceMemberStore();


/*
|--------------------------------------------------------------------------
| Search Query
|--------------------------------------------------------------------------
*/

const searchQuery =
    computed(() =>
        String(
            route.query.q ?? ""
        ).trim()
    );



/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

const openProject = (
    projectId: number
) => {

    router.push({
        name: "project-home",
        params: {
            projectId,
        },
    });

};


const openTask = (
    projectId: number
) => {

    router.push({
        name: "project-tasks",
        params: {
            projectId,
        },
    });

};


const openMember = () => {

    router.push({
        name: "workspace-members",
    });

};


/*
|--------------------------------------------------------------------------
| Normalized Query
|--------------------------------------------------------------------------
*/

const normalizedQuery =
    computed(() =>
        searchQuery.value.toLowerCase()
    );
console.log("Normalized Query", normalizedQuery.value);

/*
|--------------------------------------------------------------------------
| Project Results
|--------------------------------------------------------------------------
*/

const projectResults =
    computed(() => {

        const query =
            normalizedQuery.value;

        if (!query) {
            return [];
        }

        return projectStore.projects.filter(
            project => {

                const name =
                    project.name?.toLowerCase() ??
                    "";

                const description =
                    project.description?.toLowerCase() ??
                    "";
                const projectStatus = 
                    project.status?.toLocaleLowerCase()??
                    "";

                return (
                    name.includes(query) ||
                    description.includes(query)
                    || projectStatus.includes(query)
                );

            }
        );

    });


/*
|--------------------------------------------------------------------------
| Task Results
|--------------------------------------------------------------------------
*/

const taskResults =
    computed(() => {

        const query =
            normalizedQuery.value;

        if (!query) {
            return [];
        }

        return taskStore.tasks.filter(
            task => {

                const title =
                    task.title?.toLowerCase() ??
                    "";

                const description =
                    task.description?.toLowerCase() ??
                    "";
                const taskStatus = 
                    task.status?.toLocaleLowerCase()??
                    "";

                return (
                    title.includes(query) ||
                    description.includes(query)
                    || taskStatus.includes(query)
                );

            }
        );
        

    });


/*
|--------------------------------------------------------------------------
| Member Results
|--------------------------------------------------------------------------
*/

const memberResults =
    computed(() => {

        const query =
            normalizedQuery.value;

        if (!query) {
            return [];
        }

        return workspaceMemberStore.members.filter(
            member => {

                const fullName =
                    member.user.fullName
                        ?.toLowerCase() ??
                    "";

                const email =
                    member.user.email
                        ?.toLowerCase() ??
                    "";

                return (
                    fullName.includes(query) ||
                    email.includes(query)
                );

            }
        );

    });


/*
|--------------------------------------------------------------------------
| Total Results
|--------------------------------------------------------------------------
*/

const totalResults =
    computed(() => {

        return (
            projectResults.value.length +
            taskResults.value.length +
            memberResults.value.length
        );

    });



</script>


<template>

    <div
        class="
            mx-auto
            w-full
            max-w-4xl
            space-y-6
            px-4
            py-6
            sm:px-6
        "
    >

        <!-- HEADER -->

        <div
            class="text-center"
        >

            <p
                class="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-slate-400
                "
            >
                Global Search
            </p>


            <h1
                class="
                    mt-2
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-800
                "
            >
                Search results
            </h1>


            <p
                v-if="searchQuery"
                class="
                    mt-2
                    text-sm
                    text-slate-400
                "
            >

                Results for

                <span
                    class="
                        font-semibold
                        text-slate-600
                    "
                >
                    "{{ searchQuery }}"
                </span>

            </p>

        </div>


        <!-- NO SEARCH QUERY -->

        <div
            v-if="!searchQuery"
            class="
                flex
                min-h-[50vh]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-100
                bg-white
                px-6
                text-center
                shadow-sm
            "
        >

            <div
                class="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-50
                "
            >

                <Search
                    class="
                        h-6
                        w-6
                        text-slate-300
                    "
                />

            </div>


            <h2
                class="
                    mt-5
                    text-sm
                    font-bold
                    text-slate-700
                "
            >
                Start searching
            </h2>


            <p
                class="
                    mt-2
                    max-w-sm
                    text-xs
                    leading-5
                    text-slate-400
                "
            >
                Search for projects, tasks, or
                workspace members using the search
                bar above.
            </p>

        </div>


        <!-- SEARCH RESULTS -->

        <template v-else>

            <!-- RESULT COUNT -->

            <div
                class="text-center"
            >

                <span
                    class="
                        inline-flex
                        items-center
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                        text-[11px]
                        font-semibold
                        text-slate-500
                    "
                >
                    {{ totalResults }}
                    result{{ totalResults === 1 ? "" : "s" }}
                </span>

            </div>


            <!-- NO RESULTS -->

            <div
                v-if="totalResults === 0"
                class="
                    flex
                    min-h-64
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-100
                    bg-white
                    px-6
                    text-center
                    shadow-sm
                "
            >

                <div
                    class="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-50
                    "
                >

                    <Search
                        class="
                            h-6
                            w-6
                            text-slate-300
                        "
                    />

                </div>


                <h2
                    class="
                        mt-5
                        text-sm
                        font-bold
                        text-slate-700
                    "
                >
                    No results found
                </h2>


                <p
                    class="
                        mt-2
                        text-xs
                        text-slate-400
                    "
                >
                    Try a different search term.
                </p>

            </div>


            <!-- PROJECTS -->

            <section
                v-if="projectResults.length"
                class="space-y-3"
            >

                <div
                    class="
                        flex
                        items-center
                        justify-between
                    "
                >

                    <h2
                        class="
                            text-sm
                            font-bold
                            text-slate-700
                        "
                    >
                        Projects
                    </h2>


                    <span
                        class="
                            text-[11px]
                            font-medium
                            text-slate-400
                        "
                    >
                        {{ projectResults.length }}
                    </span>

                </div>


                <div
                    class="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-100
                        bg-white
                        shadow-sm
                    "
                >

                    <button
                        v-for="project in projectResults"
                        :key="project.id"
                        type="button"
                        class="
                            flex
                            w-full
                            items-center
                            gap-4
                            border-b
                            border-slate-100
                            px-5
                            py-4
                            text-left
                            transition-colors
                            last:border-0
                            hover:bg-slate-50
                        "
                        @click="openProject(project.id)"
                    >

                        <!-- Icon -->

                        <div
                            class="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-blue-600
                            "
                        >

                            <FolderKanban
                                class="h-4 w-4"
                            />

                        </div>


                        <!-- Content -->

                        <div
                            class="
                                min-w-0
                                flex-1
                            "
                        >

                            <p
                                class="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                {{ project.name }}
                            </p>


                            <p
                                v-if="project.description"
                                class="
                                    mt-1
                                    truncate
                                    text-xs
                                    text-slate-400
                                "
                            >
                                {{ project.description }}
                            </p>

                        </div>


                        <!-- Status -->

                        <span
                            class="
                                hidden
                                shrink-0
                                rounded-full
                                bg-slate-100
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                text-slate-500
                                sm:block
                            "
                        >
                            {{ project.status }}
                        </span>

                    </button>

                </div>

            </section>


            <!-- TASKS -->

            <section
                v-if="taskResults.length"
                class="space-y-3"
            >

                <div
                    class="
                        flex
                        items-center
                        justify-between
                    "
                >

                    <h2
                        class="
                            text-sm
                            font-bold
                            text-slate-700
                        "
                    >
                        Tasks
                    </h2>


                    <span
                        class="
                            text-[11px]
                            font-medium
                            text-slate-400
                        "
                    >
                        {{ taskResults.length }}
                    </span>

                </div>


                <div
                    class="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-100
                        bg-white
                        shadow-sm
                    "
                >

                    <button
                        v-for="task in taskResults"
                        :key="task.id"
                        type="button"
                        class="
                            flex
                            w-full
                            items-center
                            gap-4
                            border-b
                            border-slate-100
                            px-5
                            py-4
                            text-left
                            transition-colors
                            last:border-0
                            hover:bg-slate-50
                        "
                        @click="openTask(task.project.id)"
                    >

                        <!-- Icon -->

                        <div
                            class="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-emerald-50
                                text-emerald-600
                            "
                        >

                            <CheckSquare
                                class="h-4 w-4"
                            />

                        </div>


                        <!-- Content -->

                        <div
                            class="
                                min-w-0
                                flex-1
                            "
                        >

                            <p
                                class="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                {{ task.title }}
                            </p>


                            <p
                                class="
                                    mt-1
                                    truncate
                                    text-xs
                                    text-slate-400
                                "
                            >
                                {{ task.project?.name }}
                            </p>

                        </div>


                        <!-- Status -->

                        <span
                            class="
                                hidden
                                shrink-0
                                rounded-full
                                bg-slate-100
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                text-slate-500
                                sm:block
                            "
                        >
                            {{ task.status }}
                        </span>

                    </button>

                </div>

            </section>


            <!-- MEMBERS -->

            <section
                v-if="memberResults.length"
                class="space-y-3"
            >

                <div
                    class="
                        flex
                        items-center
                        justify-between
                    "
                >

                    <h2
                        class="
                            text-sm
                            font-bold
                            text-slate-700
                        "
                    >
                        Members
                    </h2>


                    <span
                        class="
                            text-[11px]
                            font-medium
                            text-slate-400
                        "
                    >
                        {{ memberResults.length }}
                    </span>

                </div>


                <div
                    class="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-100
                        bg-white
                        shadow-sm
                    "
                >

                    <button
                        v-for="member in memberResults"
                        :key="member.id"
                        type="button"
                        class="
                            flex
                            w-full
                            items-center
                            gap-4
                            border-b
                            border-slate-100
                            px-5
                            py-4
                            text-left
                            transition-colors
                            last:border-0
                            hover:bg-slate-50
                        "
                        @click="openMember"
                    >

                        <!-- Avatar -->

                        <div
                            class="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-full
                                bg-slate-100
                            "
                        >

                            <img
                                v-if="member.user.avatar"
                                :src="member.user.avatar"
                                :alt="member.user.fullName"
                                class="
                                    h-full
                                    w-full
                                    object-cover
                                "
                            />


                            <User
                                v-else
                                class="
                                    h-4
                                    w-4
                                    text-slate-400
                                "
                            />

                        </div>


                        <!-- Content -->

                        <div
                            class="
                                min-w-0
                                flex-1
                            "
                        >

                            <p
                                class="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                {{ member.user.fullName }}
                            </p>


                            <p
                                class="
                                    mt-1
                                    truncate
                                    text-xs
                                    text-slate-400
                                "
                            >
                                {{ member.user.email }}
                            </p>

                        </div>


                        <!-- Role -->

                        <span
                            class="
                                hidden
                                shrink-0
                                rounded-full
                                bg-slate-100
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                text-slate-500
                                sm:block
                            "
                        >
                            {{ member.role }}
                        </span>

                    </button>

                </div>

            </section>

        </template>

    </div>

</template>
