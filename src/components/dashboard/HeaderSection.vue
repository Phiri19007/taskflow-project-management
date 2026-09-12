<script setup lang="ts">
import {
    ref,
    computed,
    watch,
} from "vue";

import {
    useRouter,
    useRoute,
} from "vue-router";


import CreateWorkspaceDialog from "@/components/dialogs/CreateWorkspaceDialog.vue";

import { useWorkspaceStore } from "@/services/stores/workspace.store";
import { useAuthStore } from "@/services/stores/auth.store";
import { useAppStore } from "@/services/stores/app.store";
import { useToastStore } from "@/services/stores/toast.store";


import {
    Search,
    Settings,
    Bell,
    ChevronDown,
    Building2,
    User,
    LogOut,
} from "lucide-vue-next";


/*
|--------------------------------------------------------------------------
| Emits
|--------------------------------------------------------------------------
*/

const emit = defineEmits([
    "change",
]);


/*
|--------------------------------------------------------------------------
| Router / Stores
|--------------------------------------------------------------------------
*/

const router = useRouter();
const route = useRoute();

const workspaceStore =
    useWorkspaceStore();

const authStore =
    useAuthStore();

const appStore =
    useAppStore();

const toastStore =
    useToastStore();

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

const today =
    new Intl.DateTimeFormat(
        "en-US",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }
    ).format(new Date());


/*
|--------------------------------------------------------------------------
| UI State
|--------------------------------------------------------------------------
*/

const workspaceOpen =
    ref(false);

const settingsOpen =
    ref(false);

const createWorkspaceOpen =
    ref(false);

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

const searchQuery = ref(
    String(route.query.q ?? "")
);



/*
|--------------------------------------------------------------------------
| Global Search
|--------------------------------------------------------------------------
*/

async function handleSearch() {
    const query = searchQuery.value.trim();

    if (!query) {
        return;
    }

    /*
     * Enter search page
     */
    if (route.name !== "search") {
        await router.push({
            name: "search",
            query: {
                q: query,
            },
        });

        return;
    }

    /*
     * Already on search page.
     * Update the query without creating
     * another browser history entry.
     */
    await router.replace({
        name: "search",
        query: {
            q: query,
        },
    });
}


async function handleSearchInput() {
    const query = searchQuery.value.trim();

    /*
     * If the user clears the search while
     * on the search page, go back.
     */
    if (!query && route.name === "search") {
        await router.back();
    }
}




/*
|--------------------------------------------------------------------------
| Workspaces
|--------------------------------------------------------------------------
*/

const workspaces =
    computed(() =>
        workspaceStore.workspaces
    );


const currentWorkspace =
    computed(() =>
        workspaceStore.currentWorkspace
    );


/*
|--------------------------------------------------------------------------
| Select Workspace
|--------------------------------------------------------------------------
*/

async function selectWorkspace(
    workspace: typeof workspaceStore.workspaces[number]
) {

    /*
     * Already selected workspace.
     * Nothing needs to be reloaded.
     */
    if (
        workspace.id ===
        currentWorkspace.value?.id
    ) {

        workspaceOpen.value = false;

        return;
    }


    try {

        /*
         * Change the active workspace.
         */
        workspaceStore.setCurrentWorkspace(
            workspace
        );


        /*
         * Close dropdown immediately.
         */
        workspaceOpen.value = false;


        /*
         * Reload all workspace-specific
         * dashboard data:
         *
         * - projects
         * - members
         * - tasks
         * - notifications
         * etc.
         */
        await appStore.refreshDashboard();


        /*
         * Notify parent components if needed.
         */
        emit("change", workspace);


    } catch (error) {

        console.error(
            "[Header] Failed to switch workspace:",
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| User initials
|--------------------------------------------------------------------------
*/

const userInitials =
    computed(() => {

        const name =
            authStore.user?.fullName?.trim();


        if (!name) {
            return "U";
        }


        const parts =
            name
                .split(/\s+/)
                .filter(Boolean);


        const firstName =
            parts[0] ?? "";

        const lastName =
            parts[parts.length - 1] ?? "";


        if (parts.length === 1) {

            return firstName
                .charAt(0)
                .toUpperCase();

        }


        return (
            firstName.charAt(0) +
            lastName.charAt(0)
        ).toUpperCase();

    });


/*
|--------------------------------------------------------------------------
| Avatar style
|--------------------------------------------------------------------------
*/

const avatarStyle =
    computed(() => {

        const colors = [

            {
                bg: "bg-blue-100",
                text: "text-blue-700",
            },

            {
                bg: "bg-indigo-100",
                text: "text-indigo-700",
            },

            {
                bg: "bg-emerald-100",
                text: "text-emerald-700",
            },

            {
                bg: "bg-slate-200",
                text: "text-slate-700",
            },

        ];


        const name =
            authStore.user?.fullName ||
            "User";


        const index =
            name.length %
            colors.length;


        return (
            colors[index] ??
            colors[0]
        );

    });


/*
|--------------------------------------------------------------------------
| Avatar
|--------------------------------------------------------------------------
*/

const hasAvatar =
    computed(() => {

        return Boolean(
            authStore.user?.avatar?.trim()
        );

    });


/*
|--------------------------------------------------------------------------
| First name
|--------------------------------------------------------------------------
*/

const firstName =
    computed(() => {

        const name =
            authStore.user?.fullName;


        if (!name) {
            return "";
        }


        return name.split(" ")[0];

    });


/*
|--------------------------------------------------------------------------
| Workspace menu
|--------------------------------------------------------------------------
*/

function toggleWorkspace() {

    workspaceOpen.value =
        !workspaceOpen.value;

    settingsOpen.value =
        false;

}


/*
|--------------------------------------------------------------------------
| Settings menu
|--------------------------------------------------------------------------
*/

function toggleSettings() {

    settingsOpen.value =
        !settingsOpen.value;

    workspaceOpen.value =
        false;

}


/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

function goToProfile() {

    settingsOpen.value = false;

    router.push(
        "/dashboard/profile"
    );

}


/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

function goToSettings() {

    settingsOpen.value = false;

    router.push(
        "/dashboard/settings"
    );

}


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

function openNotifications() {

    router.push(
        "/dashboard/notifications"
    );

}


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

async function logout() {

    try {

        /*
         * Tell the backend to invalidate
         * the authentication session.
         */
        const response =
            await fetch(
                "/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );
        toastStore.success(
            "Logged out successfully."
        );

        if (!response.ok) {

            toastStore.error(
                "Logout failed. Please try again."
            );
            throw new Error(
                "Logout failed"
            );

        }


        /*
         * Clear all Pinia/application data.
         */
        appStore.clearAppData();


        /*
         * Close settings menu.
         */
        settingsOpen.value = false;


        /*
         * Redirect to signin.
         */
        await router.replace(
            "/signin"
        );


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}

watch(
    () => route.query.q,
    value => {

        searchQuery.value =
            String(value ?? "");

    }
);


</script>


<template>

    <header class="
            flex
            shrink-0
            flex-col
            justify-between
            gap-4
            p-6
            md:p-8
            lg:px-10
            lg:pb-4
            lg:pt-8
            sm:flex-row
            sm:items-center
        ">

        <!--
        ======================================================================
        LEFT
        ======================================================================
        -->

        <div class="
                flex
                items-center
                gap-5
            ">

            <!-- Profile -->

            <div class="
                    flex
                    items-center
                    gap-3.5
                ">

                <div class="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        bg-slate-200
                        shadow-sm
                    ">

                    <!-- User avatar -->

                    <img v-if="hasAvatar" :src="authStore.user?.avatar ??
                        undefined
                        " :alt="authStore.user?.fullName ||
                            'User Profile'
                            " class="
                            h-full
                            w-full
                            object-cover
                        " />


                    <!-- Initials fallback -->

                    <span v-else :class="[
                        avatarStyle?.bg,
                        avatarStyle?.text,
                    ]" class="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            text-sm
                            font-bold
                        ">
                        {{ userInitials }}
                    </span>

                </div>


                <div>

                    <h2 class="
                            mb-1
                            text-[16px]
                            font-bold
                            leading-none
                            text-slate-800
                        ">
                        Hey, {{ firstName }}
                    </h2>


                    <p class="
                            text-[11px]
                            font-semibold
                            tracking-wide
                            text-slate-400
                        ">
                        {{ today }}
                    </p>

                </div>

            </div>


            <!--
            ==================================================================
            WORKSPACE DROPDOWN
            ==================================================================
            -->

            <div class="
                    relative
                ">

                <button type="button" class="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-100
                        bg-white
                        px-3
                        py-2
                        text-[12px]
                        font-semibold
                        text-slate-700
                        shadow-sm
                        hover:bg-slate-50
                    " @click="toggleWorkspace">

                    <Building2 class="
                            h-4
                            w-4
                            text-slate-400
                        " />


                    <span class="
                            max-w-40
                            truncate
                        ">
                        {{
                            currentWorkspace?.name ||
                            "Select workspace"
                        }}
                    </span>


                    <ChevronDown class="
                            h-3.5
                            w-3.5
                            text-slate-400
                        " />

                </button>


                <!-- Workspace menu -->

                <div v-if="workspaceOpen" class="
                        absolute
                        left-0
                        top-12
                        z-50
                        w-56
                        rounded-xl
                        border
                        border-slate-100
                        bg-white
                        p-2
                        shadow-xl
                    ">

                    <p class="
                            px-3
                            py-2
                            text-[10px]
                            font-bold
                            uppercase
                            text-slate-400
                        ">
                        Workspaces
                    </p>


                    <!-- Workspace list -->

                    <button v-for="
workspace in workspaces
                        " :key="workspace.id" type="button" class="
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-lg
                            px-3
                            py-2
                            text-left
                            text-sm
                            hover:bg-slate-50
                        " @click="
                            selectWorkspace(
                                workspace
                            )
                            ">

                        <span class="
                                min-w-0
                                truncate
                            ">
                            {{ workspace.name }}
                        </span>


                        <span v-if="
                            workspace.id ===
                            currentWorkspace?.id
                        " class="
                                shrink-0
                                text-xs
                                font-semibold
                                text-blue-600
                            ">
                            Current
                        </span>

                    </button>


                    <!-- Create workspace -->

                    <button type="button" class="
                            w-full
                            rounded-lg
                            px-3
                            py-2
                            text-left
                            text-sm
                            text-blue-600
                            hover:bg-slate-50
                        " @click="
                            workspaceOpen = false;
                        createWorkspaceOpen = true;
                        ">
                        + Create Workspace
                    </button>

                </div>

            </div>

        </div>


        <!--
        ======================================================================
        RIGHT
        ======================================================================
        -->

        <div class="
                flex
                items-center
                gap-3
                self-end
                sm:self-center
            ">

            <!-- Search -->

            <div class="
                    relative
                    w-full
                    sm:w-72
                ">

                <Search class="
                        absolute
                        left-4
                        top-1/2
                        h-3.5
                        w-3.5
                        -translate-y-1/2
                        text-slate-300
                    " />


<input
    v-model="searchQuery"
    type="text"
    placeholder="Start searching here..."
    class="
        w-full
        rounded-full
        border-0
        bg-white
        py-2.5
        pl-10
        pr-4
        text-[11px]
        text-slate-700
        shadow-sm
        outline-none
        placeholder:text-slate-300
        focus:ring-2
        focus:ring-black/5
    "
    @input="handleSearchInput"
    @keyup.enter="handleSearch"
/>



            </div>


            <!-- Settings -->

            <div class="
                    relative
                ">

                <button type="button" class="
                        flex
                        h-9.5
                        w-9.5
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-slate-100
                        bg-white
                        text-slate-400
                        shadow-sm
                        transition-colors
                        hover:text-slate-600
                    " @click="toggleSettings">

                    <Settings class="
                            h-4
                            w-4
                        " />

                </button>


                <!-- Settings menu -->

                <div v-if="settingsOpen" class="
                        absolute
                        right-0
                        top-12
                        z-50
                        w-48
                        rounded-xl
                        border
                        border-slate-100
                        bg-white
                        p-2
                        shadow-xl
                    ">

                    <button type="button" class="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-lg
                            px-3
                            py-2
                            text-sm
                            hover:bg-slate-50
                        " @click="goToProfile">

                        <User class="
                                h-4
                                w-4
                                text-slate-400
                            " />

                        Profile

                    </button>


                    <button type="button" class="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-lg
                            px-3
                            py-2
                            text-sm
                            hover:bg-slate-50
                        " @click="goToSettings">

                        <Settings class="
                                h-4
                                w-4
                                text-slate-400
                            " />

                        Settings

                    </button>


                    <div class="
                            my-2
                            h-px
                            bg-slate-100
                        " />


                    <button type="button" class="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-lg
                            px-3
                            py-2
                            text-sm
                            text-red-500
                            hover:bg-red-50
                        " @click="logout">

                        <LogOut class="
                                h-4
                                w-4
                            " />

                        Logout

                    </button>

                </div>

            </div>


            <!-- Notifications -->

            <button type="button" class="
                    flex
                    h-9.5
                    w-9.5
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-100
                    bg-white
                    text-slate-400
                    shadow-sm
                    transition-colors
                    hover:text-slate-600
                " @click="openNotifications">

                <Bell class="
                        h-4
                        w-4
                    " />

            </button>

        </div>

    </header>


    <!--
    ==========================================================================
    CREATE WORKSPACE
    ==========================================================================
    -->

    <CreateWorkspaceDialog v-model:open="createWorkspaceOpen" />

</template>
