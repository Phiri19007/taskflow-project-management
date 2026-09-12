<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import {
    Component as ComponentIcon,
    LayoutGrid,
    FolderKanban,
    Users,
    Bell,
    Info,
    ChevronDown,
    ChevronRight
} from "lucide-vue-next";
import { useWorkspaceStore } from "@/services/stores/workspace.store";
import { useNotificationStore } from "@/services/stores/notification.store";
import { storeToRefs } from "pinia";


const router = useRouter();
const route = useRoute();


const projectsOpen = ref(false);

const activeProject = ref("Active Project");


const projects = [
    {
        name: "Active Project",
        color: "bg-[#111111]",
        route: "/dashboard/projects/active"
    },
    {
        name: "Project Done",
        color: "bg-[#10b981]",
        route: "/dashboard/projects/done"
    },
    {
        name: "Project On Hold",
        color: "bg-[#ef4444]",
        route: "/dashboard/projects/on-hold"
    }
];


const workspaceStore = useWorkspaceStore();

const notificationStore = useNotificationStore();


const {
    unreadCount
} = storeToRefs(notificationStore);




// Current active sidebar item
const activeSection = computed(() => {

    const path = route.path;


    if (path === "/dashboard") {
        return "dashboard";
    }


    if (path.includes("/projects")) {
        return "projects";
    }


    if (path.includes("/teams")) {
        return "teams";
    }


    if (path.includes("/notifications")) {
        return "notifications";
    }


    if (path.includes("/help")) {
        return "help";
    }


    return "";

});



function setActive(section: string) {


    switch (section) {


        case "dashboard":
            router.push("/dashboard");
            break;


        case "teams":
            router.push("/dashboard/teams");
            break;


        case "notifications":
            router.push("/dashboard/notifications");
            break;


        case "help":
            router.push("/dashboard/help");
            break;


    }


    if (section !== "projects") {
        projectsOpen.value = false;
    }

}



function toggleProjects() {

    projectsOpen.value = !projectsOpen.value;


    if (!projectsOpen.value) {
        return;
    }


    router.push("/dashboard/projects/active");

}



function selectProject(project: any) {

    activeProject.value = project.name;


    router.push(project.route);

}


</script>
<template>
    <!-- SIDEBAR PANEL -->
    <aside class="w-65 bg-white p-7 flex flex-col justify-between xl:flex shrink-0 border-r border-slate-200/60 h-full">

        <div>
            <!-- Brand Logo -->
            <div class="flex items-center gap-3 mb-9 px-2">
                <div
                    class="w-9 h-9 bg-[#111111] rounded-xl flex items-center justify-center text-white font-extrabold text-base tracking-tighter">
                    <ComponentIcon class="w-5 h-5" />
                </div>

                <span class="font-bold text-[19px] tracking-tight text-slate-800">
                    TaskFlow
                </span>
            </div>


            <!-- Navigation List -->
            <div class="space-y-1">

                <p class="text-[11px] font-bold text-slate-400 tracking-wide px-3 mb-4">
                    Dashboard
                </p>


                <!-- Dashboard -->
                <button @click="setActive('dashboard')" :class="[
                    'w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-[13px] shadow-lg transition-all text-left',
                    activeSection === 'dashboard'
                        ? 'bg-[#111111] text-white shadow-black/10'
                        : 'text-slate-500 hover:bg-slate-50 shadow-none'
                ]">
                    <div :class="[
                        'w-5 h-5 rounded-md flex items-center justify-center',
                        activeSection === 'dashboard'
                            ? 'bg-white/20'
                            : 'bg-slate-100'
                    ]">
                        <LayoutGrid class="w-3.5 h-3.5" />
                    </div>

                    <span>Dashboard</span>
                </button>



                <!-- Projects -->
                <div>

                    <button @click="toggleProjects" :class="[
                        'w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-[13px] transition-all text-left',
                        activeSection === 'projects'
                            ? 'bg-[#111111] text-white shadow-lg shadow-black/10'
                            : 'text-slate-500 hover:bg-slate-50'
                    ]">

                        <div class="flex items-center gap-3">

                            <FolderKanban :class="[
                                'w-4 h-4',
                                activeSection === 'projects'
                                    ? 'text-white'
                                    : 'text-slate-400'
                            ]" />

                            <span>Projects</span>

                        </div>


                        <ChevronDown v-if="projectsOpen" class="w-3.5 h-3.5" />

                        <ChevronRight v-else class="w-3.5 h-3.5" />

                    </button>



                    <!-- Project Dropdown -->
                    <div v-if="projectsOpen" class="pl-11 pr-2 mt-2.5 space-y-3 text-[12px] font-medium">

                        <button v-for="project in projects" :key="project.name" @click="selectProject(project)"
                            class="flex items-center gap-2.5 transition-all" :class="[
                                activeProject === project.name
                                    ? 'text-[#111111] font-semibold'
                                    : 'text-slate-400 hover:text-slate-600'
                            ]">

                            <span class="w-2 h-2 rounded-full" :class="project.color"></span>

                            {{ project.name }}

                        </button>

                    </div>

                </div>




                <!-- Teams -->
                <button @click="setActive('teams')" :class="[
                    'w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-[13px] transition-all mt-2 text-left',
                    activeSection === 'teams'
                        ? 'bg-[#111111] text-white shadow-lg shadow-black/10'
                        : 'text-slate-500 hover:bg-slate-50'
                ]">

                    <div class="flex items-center gap-3">

                        <Users class="w-4 h-4" />

                        <span>Teams</span>

                    </div>




                </button>




                <!-- Notifications -->
                <!-- Notifications -->
                <button @click="setActive('notifications')" :class="[
                    'w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-[13px] transition-all text-left',
                    activeSection === 'notifications'
                        ? 'bg-[#111111] text-white shadow-lg shadow-black/10'
                        : 'text-slate-500 hover:bg-slate-50'
                ]">
                    <div class="flex items-center gap-3">

                        <Bell class="w-4 h-4" />

                        <span>Notification</span>

                    </div>

                    <span v-if="unreadCount > 0"
                        class="bg-[#ff1e5e] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        {{ unreadCount }}
                    </span>
                </button>


            </div>

        </div>




        <!-- Help -->
        <button @click="setActive('help')" :class="[
            'w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-[13px] transition-all text-left',
            activeSection === 'help'
                ? 'bg-[#111111] text-white shadow-lg shadow-black/10'
                : 'text-slate-500 hover:bg-slate-50'
        ]">

            <div class="flex items-center gap-3">

                <Info class="w-4 h-4" />

                <span>Help Center</span>

            </div>

        </button>


    </aside>
</template>
