<script setup lang="ts">

import {
    Settings,
    Bell,
    ShieldCheck,
    UserRound,
    Check,
    LogOut,
    Trash2,
    ChevronRight,
    X,
    LockKeyhole,
    Loader2,
    Building2,
} from "lucide-vue-next";

import {
    ref,
    reactive,
    onMounted,
    computed,
} from "vue";

import {
    useRouter,
    useRoute,
} from "vue-router";

import {
    useToastStore,
} from "@/services/stores/toast.store";

import {
    useAuthStore,
} from "@/services/stores/auth.store";

import {
    useWorkspaceStore,
} from "@/services/stores/workspace.store";

import {
    useAppStore,
} from "@/services/stores/app.store";



/*
|--------------------------------------------------------------------------
| Stores
|--------------------------------------------------------------------------
*/

const toast = useToastStore();

const authStore = useAuthStore();

const workspaceStore = useWorkspaceStore();

const appStore = useAppStore();

const router = useRouter();


const isCheckingWorkspaceAccess = ref(true);

const canSeeWorkspaceSettings = ref(false);


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

const emailNotifications = ref(true);

const taskNotifications = ref(true);

const projectNotifications = ref(true);


/*
|--------------------------------------------------------------------------
| Workspace
|--------------------------------------------------------------------------
*/

const workspaceForm = reactive({
    name: "",
});

const isLoadingWorkspace = ref(false);

const isSavingWorkspace = ref(false);


/*
|--------------------------------------------------------------------------
| Load Workspace
|--------------------------------------------------------------------------
|
| First make sure we have a current workspace.
| Then fetch the full workspace details from
| the backend using fetchCurrentWorkspace().
|
|--------------------------------------------------------------------------
*/

async function loadWorkspace() {
    try {
        isCheckingWorkspaceAccess.value = true;
        isLoadingWorkspace.value = true;

        if (!workspaceStore.workspaces.length) {
            await workspaceStore.fetchMyWorkspaces();
        }

        const workspace =
            await workspaceStore.fetchCurrentWorkspace();

        if (workspace) {
            workspaceForm.name = workspace.name;
        }

        const workspaceOwnerId =
            workspace?.owner?.id;

        const currentUserId =
            authStore.user?.id;

        console.log("Workspace owner ID:", workspaceOwnerId);
        console.log("Current user ID:", currentUserId);

        canSeeWorkspaceSettings.value =
            workspaceOwnerId != null &&
            currentUserId != null &&
            String(workspaceOwnerId) ===
            String(currentUserId);

    } catch (error) {
        console.error("Failed to load workspace:", error);

        canSeeWorkspaceSettings.value = false;

    } finally {
        isLoadingWorkspace.value = false;
        isCheckingWorkspaceAccess.value = false;
    }
}




/*
|--------------------------------------------------------------------------
| Save Workspace
|--------------------------------------------------------------------------
*/

async function saveWorkspace() {

    const workspace =
        workspaceStore.currentWorkspace;


    /*
     * Make sure there is a current workspace.
     */
    if (!workspace) {

        toast.error(
            "No workspace selected."
        );

        return;
    }


    /*
     * Workspace name is required.
     */
    if (!workspaceForm.name.trim()) {

        toast.error(
            "Workspace name is required."
        );

        return;
    }


    try {

        isSavingWorkspace.value = true;


        /*
         * Connect this to your actual workspace
         * update API.
         *
         * Example:
         *
         * const { data } =
         *     await workspaceService.update(
         *         String(workspace.id),
         *         {
         *             name:
         *                 workspaceForm.name.trim(),
         *
         *             description:
         *                 workspaceForm.description.trim()
         *                     || null,
         *         }
         *     );
         *
         * workspaceStore.setCurrentWorkspace(data);
         */


        /*
         * Temporary delay until the update API
         * is connected.
         */
        await new Promise(
            resolve =>
                setTimeout(resolve, 400)
        );


        /*
         * Update local workspace state so the UI
         * immediately reflects the changes.
         */
        workspace.name =
            workspaceForm.name.trim();


        toast.success(
            "Workspace settings saved successfully."
        );

    } catch (error) {

        console.error(
            "Failed to save workspace:",
            error
        );

        toast.error(
            "Failed to save workspace settings."
        );

    } finally {

        isSavingWorkspace.value = false;
    }
}


/*
|--------------------------------------------------------------------------
| Password Dialog
|--------------------------------------------------------------------------
*/

const passwordForm = reactive({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
});

const passwordErrors = reactive({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
});

const isPasswordDialogOpen = ref(false);

const isChangingPassword = ref(false);


/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

const isSaving = ref(false);


/*
|--------------------------------------------------------------------------
| Open Password Dialog
|--------------------------------------------------------------------------
*/

function openPasswordDialog() {

    /*
     * Always start with a clean form.
     */

    passwordForm.currentPassword = "";

    passwordForm.newPassword = "";

    passwordForm.confirmPassword = "";

    clearPasswordErrors();

    isPasswordDialogOpen.value = true;
}


/*
|--------------------------------------------------------------------------
| Close Password Dialog
|--------------------------------------------------------------------------
*/

function closePasswordDialog() {

    /*
     * Don't allow the dialog to close while
     * the password request is running.
     */

    if (isChangingPassword.value) {
        return;
    }


    isPasswordDialogOpen.value = false;

    resetPasswordForm();
}


/*
|--------------------------------------------------------------------------
| Reset Password Form
|--------------------------------------------------------------------------
*/

function resetPasswordForm() {

    passwordForm.currentPassword = "";

    passwordForm.newPassword = "";

    passwordForm.confirmPassword = "";

    clearPasswordErrors();
}


/*
|--------------------------------------------------------------------------
| Password Errors
|--------------------------------------------------------------------------
*/

function clearPasswordErrors() {

    passwordErrors.currentPassword = "";

    passwordErrors.newPassword = "";

    passwordErrors.confirmPassword = "";
}


/*
|--------------------------------------------------------------------------
| Validate New Password
|--------------------------------------------------------------------------
*/

function validateNewPassword() {

    /*
     * Clear the error when the field is empty.
     */

    if (!passwordForm.newPassword) {

        passwordErrors.newPassword = "";


        /*
         * Nothing to compare if confirmation
         * is also empty.
         */

        if (!passwordForm.confirmPassword) {

            passwordErrors.confirmPassword = "";
        }

        return;
    }


    /*
     * Minimum password length.
     */

    if (passwordForm.newPassword.length < 8) {

        passwordErrors.newPassword =
            "Password must be at least 8 characters.";

    } else {

        passwordErrors.newPassword = "";
    }


    /*
     * Validate confirmation if it already
     * contains a value.
     */

    if (passwordForm.confirmPassword) {

        validatePasswordMatch();
    }
}


/*
|--------------------------------------------------------------------------
| Validate Password Match
|--------------------------------------------------------------------------
*/

function validatePasswordMatch() {

    /*
     * Don't show an error when confirmation
     * is still empty.
     */

    if (!passwordForm.confirmPassword) {

        passwordErrors.confirmPassword = "";

        return true;
    }


    /*
     * Compare both passwords.
     */

    if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
    ) {

        passwordErrors.confirmPassword =
            "Passwords do not match.";

        return false;
    }


    /*
     * Passwords match.
     */

    passwordErrors.confirmPassword = "";

    return true;
}


/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

async function changePassword() {

    /*
     * Clear previous validation errors.
     */

    clearPasswordErrors();


    /*
     * Current password validation.
     */

    if (!passwordForm.currentPassword) {

        passwordErrors.currentPassword =
            "Please enter your current password.";

        return;
    }


    /*
     * New password validation.
     */

    if (!passwordForm.newPassword) {

        passwordErrors.newPassword =
            "Please enter a new password.";

        return;
    }


    /*
     * Minimum password length.
     */

    if (passwordForm.newPassword.length < 8) {

        passwordErrors.newPassword =
            "Password must be at least 8 characters.";

        return;
    }


    /*
     * Confirmation validation.
     */

    if (!passwordForm.confirmPassword) {

        passwordErrors.confirmPassword =
            "Please confirm your new password.";

        return;
    }


    /*
     * Password match validation.
     */

    if (!validatePasswordMatch()) {

        return;
    }


    try {

        isChangingPassword.value = true;


        /*
         * Send only the fields required by
         * the backend.
         */

        await authStore.changePassword({

            currentPassword:
                passwordForm.currentPassword,

            newPassword:
                passwordForm.newPassword,

        });


        /*
         * Stop loading before closing.
         */

        isChangingPassword.value = false;


        /*
         * Close and reset the dialog.
         */

        isPasswordDialogOpen.value = false;

        resetPasswordForm();


        /*
         * Success message.
         */

        toast.success(
            "Password changed successfully."
        );

    } catch (error: any) {

        console.error(
            "Failed to change password:",
            error
        );


        /*
         * Get the message returned by NestJS.
         */

        const message =
            error?.response?.data?.message ??
            error?.message;


        /*
         * Current password is incorrect.
         */

        if (
            message ===
            "Current password is incorrect."
        ) {

            passwordErrors.currentPassword =
                message;

            return;
        }


        /*
         * Handle NestJS validation errors.
         */

        if (Array.isArray(message)) {

            passwordErrors.newPassword =
                message.join(" ");

            toast.error(
                "Please check your new password."
            );

            return;
        }


        /*
         * Backend returned a useful message.
         */

        if (typeof message === "string") {

            passwordErrors.currentPassword =
                message;

            toast.error(message);

            return;
        }


        /*
         * Generic error.
         */

        passwordErrors.currentPassword =
            "Unable to change your password. Please try again.";

        toast.error(
            "Unable to change your password. Please try again."
        );

    } finally {

        isChangingPassword.value = false;
    }
}


/*
|--------------------------------------------------------------------------
| Save Settings
|--------------------------------------------------------------------------
*/

async function saveSettings() {

    try {

        isSaving.value = true;


        /*
         * Replace this with your actual
         * settings API.
         */

        await new Promise(
            resolve =>
                setTimeout(resolve, 400)
        );


        toast.success(
            "Settings saved successfully."
        );

    } catch (error) {

        console.error(
            "Failed to save settings:",
            error
        );

        toast.error(
            "Failed to save settings."
        );

    } finally {

        isSaving.value = false;
    }
}


/*
|--------------------------------------------------------------------------
| Sign Out
|--------------------------------------------------------------------------
*/

async function signOut() {
    try {
        /*
         * Tell the backend to invalidate
         * the authentication session.
         */
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        /*
         * Clear all Pinia/application data.
         */
        appStore.clearAppData();

        await router.replace(
            "/signin"
        );

        toast.success("Logged out successfully.");
    } catch (error) {
        console.error("Logout error:", error);
        toast.error("Logout failed. Please try again.");
    }
}

/*
    Check if the user can see the work space settings
*/

/*
|--------------------------------------------------------------------------
| Delete Account
|--------------------------------------------------------------------------
*/

function deleteAccount() {

    /*
     * Replace this with a real confirmation
     * dialog and delete-account API call.
     */

    toast.error(
        "Please confirm account deletion."
    );
}


/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(() => {

    loadWorkspace();

});


function formatDate(date: string | Date | null | undefined) {
    if (!date) {
        return "—";
    }

    const value =
        date instanceof Date
            ? date.toISOString()
            : date
                .replace(" ", "T")
                .replace(/\.(\d{3})\d+$/, ".$1");

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/*
|--------------------------------------------------------------------------
| Delete Workspace
|--------------------------------------------------------------------------
*/

async function deleteWorkspace() {

    const workspace =
        workspaceStore.currentWorkspace;


    if (!workspace) {

        toast.error(
            "No workspace selected."
        );

        return;
    }


    if (
        workspace.owner?.id !==
        authStore.user?.id
    ) {

        toast.error(
            "Only the workspace owner can delete the workspace."
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        isSavingWorkspace.value = true;


        await workspaceStore.deleteWorkspace(
            workspace.id
        );


        /*
         * Remove it from the workspace list.
         */
        const index =
            workspaceStore.workspaces.findIndex(
                item =>
                    item.id === workspace.id
            );


        if (index !== -1) {

            workspaceStore.workspaces.splice(
                index,
                1
            );

        }


        /*
         * Select another workspace if available.
         */
        const nextWorkspace =
            workspaceStore.workspaces[0];


        if (nextWorkspace) {

            workspaceStore.setCurrentWorkspace(
                nextWorkspace
            );


            /*
             * Load the full details of the new
             * current workspace.
             */
            await workspaceStore.fetchCurrentWorkspace();


            const newWorkspace =
                workspaceStore.currentWorkspace;


            workspaceForm.name =
                newWorkspace?.name ?? "";


        } else {

            workspaceStore.clear();


            workspaceForm.name = "";


        }



        toast.success(
            "Workspace deleted successfully."
        );

    } catch (error: any) {

        console.error(
            "Failed to delete workspace:",
            error
        );


        const message =
            error?.response?.data?.message ??
            error?.message;


        toast.error(
            typeof message === "string"
                ? message
                : "Failed to delete workspace."
        );

    } finally {

        isSavingWorkspace.value = false;
    }
}




</script>



<template>

    <main class="
            flex-1
            h-full
            overflow-y-auto
            bg-[#f4f7fa]
            p-6
            pt-0
            md:p-8
            lg:p-10
        ">

        <div class="
                mx-auto
                w-full
                max-w-4xl
            ">

            <!-- ================================================= -->
            <!-- HEADER -->
            <!-- ================================================= -->

            <div class="
                    border-b
                    border-slate-200/60
                    pb-5
                ">

                <h1 class="
                        flex
                        items-center
                        gap-2
                        text-xl
                        font-bold
                        tracking-tight
                        text-slate-900
                    ">

                    <Settings class="
                            h-5
                            w-5
                            text-slate-700
                        " />

                    Settings

                </h1>


                <p class="
                        mt-1
                        text-[12px]
                        font-medium
                        text-slate-400
                    ">
                    Manage your project management preferences
                    and account settings.
                </p>

            </div>


            <!-- ================================================= -->
            <!-- SETTINGS -->
            <!-- ================================================= -->

            <div class="mt-6 space-y-4">


                <!-- ================================================= -->
                <!-- WORKSPACE -->
                <!-- ================================================= -->

                <section v-if="!isCheckingWorkspaceAccess && canSeeWorkspaceSettings" class="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/70
        bg-white
        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]
    ">

                    <!-- ================================================= -->
                    <!-- HEADER -->
                    <!-- ================================================= -->

                    <div class="
            border-b
            border-slate-100
            p-6
        ">

                        <div class="
                flex
                items-start
                gap-3
            ">

                            <div class="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                ">

                                <Building2 class="h-4.5 w-4.5" />

                            </div>


                            <div>

                                <h2 class="
                        text-sm
                        font-bold
                        text-slate-900
                    ">
                                    Workspace
                                </h2>


                                <p class="
                        mt-1
                        text-[11px]
                        leading-5
                        text-slate-400
                    ">
                                    Manage your workspace information,
                                    members, and access.
                                </p>

                            </div>

                        </div>

                    </div>


                    <!-- ================================================= -->
                    <!-- WORKSPACE SETTINGS -->
                    <!-- ================================================= -->

                    <div class="divide-y divide-slate-100">


                        <!-- ================================================= -->
                        <!-- WORKSPACE NAME + INFORMATION -->
                        <!-- ================================================= -->

                        <div class="p-6">

                            <!-- Workspace Name -->

                            <div>

                                <p class="
                        text-xs
                        font-semibold
                        text-slate-800
                    ">
                                    Workspace name
                                </p>


                                <p class="
                        mt-1
                        text-[10px]
                        text-slate-400
                    ">
                                    Choose a name that helps your team
                                    identify this workspace.
                                </p>

                            </div>


                            <!-- Loading -->

                            <div v-if="isLoadingWorkspace" class="
                    mt-4
                    flex
                    items-center
                    justify-center
                    py-4
                ">

                                <Loader2 class="
                        h-5
                        w-5
                        animate-spin
                        text-slate-400
                    " />

                            </div>


                            <!-- Workspace -->

                            <div v-else-if="workspaceStore.currentWorkspace" class="mt-4">

                                <!-- Name Input -->

                                <input v-model="workspaceForm.name" type="text" placeholder="Enter workspace name"
                                    class="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        py-3
                        text-sm
                        font-medium
                        text-slate-800
                        outline-none
                        transition
                        placeholder:text-slate-300
                        focus:border-slate-400
                        focus:ring-2
                        focus:ring-slate-100
                    " />


                                <!-- ================================================= -->
                                <!-- WORKSPACE INFORMATION -->
                                <!-- ================================================= -->

                                <div class="
                        mt-4
                        grid
                        gap-3
                        rounded-xl
                        border
                        border-slate-100
                        bg-slate-50
                        p-4
                        sm:grid-cols-2
                    ">

                                    <!-- Owner -->

                                    <div>

                                        <p class="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-slate-400
                            ">
                                            Workspace owner
                                        </p>


                                        <p class="
                                mt-1
                                text-xs
                                font-semibold
                                text-slate-700
                            ">
                                            {{
                                                workspaceStore
                                                    .currentWorkspace
                                                    .owner
                                                    ?.fullName ??
                                            "Workspace owner"
                                            }}
                                        </p>

                                    </div>


                                    <!-- Created -->

                                    <div>

                                        <p class="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-slate-400
                            ">
                                            Created
                                        </p>


                                        <p class="
                                mt-1
                                text-xs
                                font-semibold
                                text-slate-700
                            ">
                                            {{
                                                formatDate(
                                                    workspaceStore
                                                        .currentWorkspace
                                                        ?.createdAt
                                            )
                                            }}
                                        </p>

                                    </div>

                                </div>


                                <!-- Save -->

                                <div class="
                        mt-4
                        flex
                        justify-end
                    ">

                                    <button type="button" class="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#111111]
                            px-5
                            py-2.5
                            text-[11px]
                            font-bold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-slate-800
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        " :disabled="isSavingWorkspace ||
                            !workspaceForm.name.trim()
                            " @click="saveWorkspace">

                                        <Loader2 v-if="isSavingWorkspace" class="
                                h-3.5
                                w-3.5
                                animate-spin
                            " />

                                        <Check v-else class="
                                h-3.5
                                w-3.5
                            " />

                                        {{
                                            isSavingWorkspace
                                                ? "Saving..."
                                                : "Save Workspace"
                                        }}

                                    </button>

                                </div>

                            </div>


                            <!-- No Workspace -->

                            <div v-else class="
                    mt-4
                    rounded-xl
                    border
                    border-dashed
                    border-slate-200
                    bg-slate-50
                    p-4
                    text-center
                ">

                                <Building2 class="
                        mx-auto
                        h-5
                        w-5
                        text-slate-300
                    " />

                                <p class="
                        mt-2
                        text-xs
                        font-semibold
                        text-slate-600
                    ">
                                    No workspace selected
                                </p>


                                <p class="
                        mt-1
                        text-[10px]
                        text-slate-400
                    ">
                                    Select a workspace before managing
                                    its settings.
                                </p>

                            </div>

                        </div>


                        <!-- ================================================= -->
                        <!-- WORKSPACE MEMBERS -->
                        <!-- ================================================= -->

                        <button type="button" class="
                flex
                w-full
                items-center
                justify-between
                gap-4
                p-6
                text-left
                transition
                hover:bg-slate-50/70
                cursor-pointer
            " @click="$router.push({ name: 'workspace-members' })">

                            <div class="
                    flex
                    min-w-0
                    items-center
                    gap-3
                ">

                                <div class="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-purple-50
                        text-purple-600
                    ">

                                    <UserRound class="
                            h-4
                            w-4
                        " />

                                </div>


                                <div class="min-w-0">

                                    <p class="
                            text-xs
                            font-semibold
                            text-slate-800
                        ">
                                        Workspace members
                                    </p>


                                    <p class="
                            mt-1
                            text-[10px]
                            text-slate-400
                        ">
                                        Remove and manage workspace members.
                                    </p>

                                </div>

                            </div>


                            <ChevronRight class="
                    h-4
                    w-4
                    shrink-0
                    text-slate-300
                " />

                        </button>


                        <!-- ================================================= -->
                        <!-- DELETE WORKSPACE -->
                        <!-- ================================================= -->

                        <div class="
                flex
                items-center
                justify-between
                gap-4
                p-6
            ">

                            <div class="
                    flex
                    min-w-0
                    items-center
                    gap-3
                ">

                                <div class="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-red-50
                        text-red-500
                    ">

                                    <Trash2 class="
                            h-4
                            w-4
                        " />

                                </div>


                                <div>

                                    <p class="
                            text-xs
                            font-semibold
                            text-slate-800
                        ">
                                        Delete workspace
                                    </p>


                                    <p class="
                            mt-1
                            text-[10px]
                            text-slate-400
                        ">
                                        Permanently delete this workspace
                                        and its associated data.
                                    </p>

                                </div>

                            </div>


                            <button type="button" class="
                    inline-flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-red-200
                    bg-white
                    px-4
                    py-2
                    text-[11px]
                    font-semibold
                    text-red-500
                    transition
                    hover:bg-red-50
                    cursor-pointer
                " @click="deleteWorkspace">

                                <Trash2 class="
                        h-3.5
                        w-3.5
                    " />

                                Delete

                            </button>

                        </div>

                    </div>

                </section>




                <!-- ================================================= -->
                <!-- NOTIFICATIONS -->
                <!-- ================================================= -->

                <section class="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200/70
                        bg-white
                        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]
                    ">

                    <!-- Header -->

                    <div class="
                            border-b
                            border-slate-100
                            p-6
                        ">

                        <div class="
                                flex
                                items-start
                                gap-3
                            ">

                            <div class="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-amber-50
                                    text-amber-600
                                ">

                                <Bell class="
                                        h-4.5
                                        w-4.5
                                    " />

                            </div>


                            <div>

                                <h2 class="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    ">
                                    Notifications
                                </h2>


                                <p class="
                                        mt-1
                                        text-[11px]
                                        leading-5
                                        text-slate-400
                                    ">
                                    Choose which project activities
                                    you want to be notified about.
                                </p>

                            </div>

                        </div>

                    </div>


                    <!-- Settings -->

                    <div class="
                            divide-y
                            divide-slate-100
                        ">


                        <!-- ================================================= -->
                        <!-- EMAIL -->
                        <!-- ================================================= -->

                        <div class="
                                flex
                                items-center
                                justify-between
                                gap-4
                                p-6
                            ">

                            <div>

                                <p class="
                                        text-xs
                                        font-semibold
                                        text-slate-800
                                    ">
                                    Email notifications
                                </p>


                                <p class="
                                        mt-1
                                        text-[10px]
                                        text-slate-400
                                    ">
                                    Receive important updates by email.
                                </p>

                            </div>


                            <!-- Toggle -->

                            <button type="button" role="switch" :aria-checked="emailNotifications" :class="emailNotifications
                                ? 'bg-[#111111]'
                                : 'bg-slate-200'
                                " class="
                                    relative
                                    h-6
                                    w-11
                                    shrink-0
                                    rounded-full
                                    transition-colors
                                     cursor-pointer
                                    duration-200
                                    ease-in-out
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-slate-200
                                " @click="
                                    emailNotifications =
                                    !emailNotifications
                                    ">

                                <span :class="emailNotifications
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                    " class="
                                        absolute
                                        left-0
                                        top-1
                                        h-4
                                        w-4
                                        rounded-full
                                        bg-white
                                        shadow-sm
                                        transition-transform
                                        duration-200
                                        ease-in-out
                                    "></span>

                            </button>

                        </div>


                        <!-- ================================================= -->
                        <!-- TASKS -->
                        <!-- ================================================= -->

                        <div class="
                                flex
                                items-center
                                justify-between
                                gap-4
                                p-6
                            ">

                            <div>

                                <p class="
                                        text-xs
                                        font-semibold
                                        text-slate-800
                                    ">
                                    Task activity
                                </p>


                                <p class="
                                        mt-1
                                        text-[10px]
                                        text-slate-400
                                    ">
                                    Assignments, completions and due dates.
                                </p>

                            </div>


                            <button type="button" role="switch" :aria-checked="taskNotifications" :class="taskNotifications
                                ? 'bg-[#111111]'
                                : 'bg-slate-200'
                                " class="
                                    relative
                                    h-6
                                    w-11
                                    shrink-0
                                    rounded-full
                                    transition-colors
                                     cursor-pointer
                                    duration-200
                                    ease-in-out
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-slate-200
                                " @click="
                                    taskNotifications =
                                    !taskNotifications
                                    ">

                                <span :class="taskNotifications
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                    " class="
                                        absolute
                                        left-0
                                        top-1
                                        h-4
                                        w-4
                                        rounded-full
                                        bg-white
                                        shadow-sm
                                        transition-transform
                                        duration-200
                                        ease-in-out
                                    "></span>

                            </button>

                        </div>


                        <!-- ================================================= -->
                        <!-- PROJECTS -->
                        <!-- ================================================= -->

                        <div class="
                                flex
                                items-center
                                justify-between
                                gap-4
                                p-6
                            ">

                            <div>

                                <p class="
                                        text-xs
                                        font-semibold
                                        text-slate-800
                                    ">
                                    Project activity
                                </p>


                                <p class="
                                        mt-1
                                        text-[10px]
                                        text-slate-400
                                    ">
                                    Project updates and member activity.
                                </p>

                            </div>


                            <button type="button" role="switch" :aria-checked="projectNotifications" :class="projectNotifications
                                ? 'bg-[#111111]'
                                : 'bg-slate-200'
                                " class="
                                    relative
                                    h-6
                                    w-11
                                    shrink-0
                                    rounded-full
                                    transition-colors
                                    duration-200
                                    ease-in-out
                                    focus:outline-none
                                     cursor-pointer
                                    focus:ring-2
                                    focus:ring-slate-200
                                " @click="
                                    projectNotifications =
                                    !projectNotifications
                                    ">

                                <span :class="projectNotifications
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                    " class="
                                        absolute
                                        left-0
                                        top-1
                                        h-4
                                        w-4
                                        rounded-full
                                        bg-white
                                        shadow-sm
                                        transition-transform
                                        duration-200
                                        ease-in-out
                                    "></span>

                            </button>

                        </div>

                    </div>

                </section>


                <!-- ================================================= -->
                <!-- SECURITY -->
                <!-- ================================================= -->

                <section class="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200/70
                        bg-white
                        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]
                    ">

                    <!-- Header -->

                    <div class="
                            border-b
                            border-slate-100
                            p-6
                        ">

                        <div class="
                                flex
                                items-start
                                gap-3
                            ">

                            <div class="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-emerald-50
                                    text-emerald-600
                                ">

                                <ShieldCheck class="
                                        h-4.5
                                        w-4.5
                                    " />

                            </div>


                            <div>

                                <h2 class="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    ">
                                    Security
                                </h2>


                                <p class="
                                        mt-1
                                        text-[11px]
                                        leading-5
                                        text-slate-400
                                    ">
                                    Manage your account security
                                    and authentication.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div class="
                            divide-y
                            divide-slate-100
                        ">


                        <!-- ================================================= -->
                        <!-- CHANGE PASSWORD -->
                        <!-- ================================================= -->

                        <button type="button" class="
                                flex
                                w-full
                                items-center
                                cursor-pointer
                                justify-between
                                p-6
                                text-left
                                transition
                                hover:bg-slate-50/70
                            " @click="openPasswordDialog">

                            <div class="
                                    flex
                                    items-center
                                    gap-3
                                ">

                                <UserRound class="
                                        h-4
                                        w-4
                                        text-slate-400
                                    " />


                                <div>

                                    <p class="
                                            text-xs
                                            font-semibold
                                            text-slate-800
                                        ">
                                        Change password
                                    </p>


                                    <p class="
                                            mt-1
                                            text-[10px]
                                            text-slate-400
                                        ">
                                        Update your account password.
                                    </p>

                                </div>

                            </div>


                            <ChevronRight class="
                                    h-4
                                    w-4
                                    text-slate-300
                                " />

                        </button>


                        <!-- ================================================= -->
                        <!-- SIGN OUT -->
                        <!-- ================================================= -->

                        <div class="
                                flex
                                items-center
                                justify-between
                                gap-4
                                p-6
                            ">

                            <div>

                                <p class="
                                        text-xs
                                        font-semibold
                                        text-slate-800
                                    ">
                                    Sign out
                                </p>


                                <p class="
                                        mt-1
                                        text-[10px]
                                        text-slate-400
                                    ">
                                    Sign out of your account.
                                </p>

                            </div>


                            <button type="button" class="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    cursor-pointer
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-2
                                    text-[11px]
                                    font-semibold
                                    text-slate-600
                                    transition
                                    hover:border-red-200
                                    hover:bg-red-50
                                    hover:text-red-600
                                " @click="signOut">

                                <LogOut class="
                                        h-3.5
                                        w-3.5
                                    " />

                                Sign Out

                            </button>

                        </div>

                    </div>

                </section>


                <!-- ================================================= -->
                <!-- SAVE -->
                <!-- ================================================= -->

                <div class="
                        flex
                        justify-end
                        pt-2
                    ">

                    <button type="button" class="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#111111]
                            px-5
                            py-2.5
                            text-[11px]
                            font-bold
                            text-white
                            cursor-pointer
                            shadow-sm
                            transition
                            hover:bg-slate-800
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        " :disabled="isSaving" @click="saveSettings">

                        <Loader2 v-if="isSaving" class="
                                h-3.5
                                w-3.5
                                animate-spin
                            " />

                        <Check v-else class="
                                h-3.5
                                w-3.5
                            " />

                        {{
                            isSaving
                                ? "Saving..."
                                : "Save Settings"
                        }}

                    </button>

                </div>


                <!-- ================================================= -->
                <!-- DANGER ZONE -->
                <!-- ================================================= -->

                <section class="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-red-100
                        bg-white
                    ">

                    <div class="p-6">

                        <div class="
                                flex
                                items-start
                                gap-3
                            ">

                            <div class="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-50
                                    text-red-500
                                ">

                                <Trash2 class="h-4 w-4" />

                            </div>


                            <div class="flex-1">

                                <h2 class="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    ">
                                    Delete account
                                </h2>


                                <p class="
                                        mt-1
                                        text-[11px]
                                        leading-5
                                        text-slate-400
                                    ">
                                    Permanently delete your account,
                                    projects, tasks, and associated data.
                                </p>


                                <button type="button" class="
                                        mt-4
                                        inline-flex
                                        items-center
                                        cursor-pointer
                                        gap-2
                                        rounded-xl
                                        border
                                        border-red-200
                                        bg-white
                                        px-4
                                        py-2
                                        text-[11px]
                                        font-semibold
                                        text-red-500
                                        transition
                                        hover:bg-red-50
                                    " @click="deleteAccount">

                                    <Trash2 class="
                                            h-3.5
                                            w-3.5
                                        " />

                                    Delete Account

                                </button>

                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </div>

    </main>


    <!-- ================================================= -->
    <!-- CHANGE PASSWORD DIALOG -->
    <!-- ================================================= -->

    <Teleport to="body">

        <Transition name="fade">

            <div v-if="isPasswordDialogOpen" class="
                    fixed
                    inset-0
                    z-100
                    flex
                    items-center
                    justify-center
                    bg-slate-950/40
                    p-5
                    backdrop-blur-sm
                " @click.self="closePasswordDialog">

                <div class="
                        w-full
                        max-w-xl
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]
                    ">

                    <!-- ================================================= -->
                    <!-- DIALOG HEADER -->
                    <!-- ================================================= -->

                    <div class="
                            flex
                            items-start
                            justify-between
                            border-b
                            border-slate-100
                            px-7
                            py-5
                        ">

                        <div class="
                                flex
                                items-start
                                gap-3
                            ">

                            <div class="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-emerald-50
                                    text-emerald-600
                                ">

                                <LockKeyhole class="
                                        h-4.5
                                        w-4.5
                                    " />

                            </div>


                            <div>

                                <h2 class="
                                        text-base
                                        font-bold
                                        text-slate-900
                                    ">
                                    Change password
                                </h2>


                                <p class="
                                        mt-1
                                        text-[11px]
                                        leading-5
                                        text-slate-400
                                    ">
                                    Update your password to keep your
                                    account secure.
                                </p>

                            </div>

                        </div>


                        <button type="button" class="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-slate-100
                                hover:text-slate-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            " :disabled="isChangingPassword" @click="closePasswordDialog">

                            <X class="
                                    h-4
                                    w-4
                                " />

                        </button>

                    </div>


                    <!-- ================================================= -->
                    <!-- FORM -->
                    <!-- ================================================= -->

                    <form class="p-7" @submit.prevent="changePassword">

                        <div class="space-y-5">


                            <!-- ================================================= -->
                            <!-- CURRENT PASSWORD -->
                            <!-- ================================================= -->

                            <div>

                                <label class="
                                        mb-2
                                        block
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    ">
                                    Current password
                                </label>


                                <input v-model="passwordForm.currentPassword" type="password"
                                    autocomplete="current-password" placeholder="Enter your current password" class="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-3.5
                                        py-3
                                        text-sm
                                        font-medium
                                        text-slate-800
                                        outline-none
                                        transition
                                        placeholder:text-slate-300
                                        focus:border-slate-400
                                        focus:ring-2
                                        focus:ring-slate-100
                                        disabled:cursor-not-allowed
                                        disabled:bg-slate-50
                                    " :class="passwordErrors.currentPassword
                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                                        : ''
                                        " :disabled="isChangingPassword" @input="
                                            passwordErrors.currentPassword = ''
                                            " />


                                <p v-if="passwordErrors.currentPassword" class="
                                        mt-1.5
                                        flex
                                        items-center
                                        gap-1
                                        text-[10px]
                                        font-medium
                                        text-red-500
                                    ">

                                    <span class="
                                            h-1
                                            w-1
                                            rounded-full
                                            bg-red-500
                                        "></span>

                                    {{ passwordErrors.currentPassword }}

                                </p>

                            </div>


                            <!-- ================================================= -->
                            <!-- NEW PASSWORD -->
                            <!-- ================================================= -->

                            <div>

                                <label class="
                                        mb-2
                                        block
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    ">
                                    New password
                                </label>


                                <input v-model="passwordForm.newPassword" type="password" autocomplete="new-password"
                                    placeholder="Enter your new password" class="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-3.5
                                        py-3
                                        text-sm
                                        font-medium
                                        text-slate-800
                                        outline-none
                                        transition
                                        placeholder:text-slate-300
                                        focus:border-slate-400
                                        focus:ring-2
                                        focus:ring-slate-100
                                        disabled:cursor-not-allowed
                                        disabled:bg-slate-50
                                    " :class="passwordErrors.newPassword
                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                                        : ''
                                        " :disabled="isChangingPassword" @input="validateNewPassword" />


                                <p v-if="passwordErrors.newPassword" class="
                                        mt-1.5
                                        flex
                                        items-center
                                        gap-1
                                        text-[10px]
                                        font-medium
                                        text-red-500
                                    ">

                                    <span class="
                                            h-1
                                            w-1
                                            rounded-full
                                            bg-red-500
                                        "></span>

                                    {{ passwordErrors.newPassword }}

                                </p>


                                <p v-else class="
                                        mt-1.5
                                        text-[10px]
                                        text-slate-400
                                    ">
                                    Use at least 8 characters.
                                </p>

                            </div>


                            <!-- ================================================= -->
                            <!-- CONFIRM PASSWORD -->
                            <!-- ================================================= -->

                            <div>

                                <label class="
                                        mb-2
                                        block
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    ">
                                    Confirm new password
                                </label>


                                <input v-model="passwordForm.confirmPassword" type="password"
                                    autocomplete="new-password" placeholder="Confirm your new password" class="
                                        w-full
                                        rounded-xl
                                        border
                                        bg-white
                                        px-3.5
                                        py-3
                                        text-sm
                                        font-medium
                                        text-slate-800
                                        outline-none
                                        transition
                                        placeholder:text-slate-300
                                        focus:ring-2
                                        disabled:cursor-not-allowed
                                        disabled:bg-slate-50
                                    " :class="passwordErrors.confirmPassword
                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                                        : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'
                                        " :disabled="isChangingPassword" @input="validatePasswordMatch" />


                                <!-- Error under confirmation -->

                                <p v-if="passwordErrors.confirmPassword" class="
                                        mt-1.5
                                        flex
                                        items-center
                                        gap-1
                                        text-[10px]
                                        font-medium
                                        text-red-500
                                    ">

                                    <span class="
                                            h-1
                                            w-1
                                            rounded-full
                                            bg-red-500
                                        "></span>

                                    {{ passwordErrors.confirmPassword }}

                                </p>

                            </div>

                        </div>


                        <!-- ================================================= -->
                        <!-- SECURITY MESSAGE -->
                        <!-- ================================================= -->

                        <div class="
                                mt-5
                                flex
                                items-start
                                gap-2.5
                                rounded-xl
                                border
                                border-slate-100
                                bg-slate-50
                                px-3.5
                                py-3
                            ">

                            <ShieldCheck class="
                                    mt-0.5
                                    h-4
                                    w-4
                                    shrink-0
                                    text-slate-400
                                " />


                            <p class="
                                    text-[10px]
                                    leading-5
                                    text-slate-400
                                ">
                                Your password is securely updated on the
                                server. Choose a strong password that you
                                do not use elsewhere.
                            </p>

                        </div>


                        <!-- ================================================= -->
                        <!-- FOOTER -->
                        <!-- ================================================= -->

                        <div class="
                                mt-6
                                flex
                                items-center
                                justify-between
                                gap-2
                                border-t
                                border-slate-100
                                pt-5
                            ">

                            <!-- Cancel -->

                            <button type="button" class="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-2.5
                                    text-[11px]
                                    font-semibold
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                " :disabled="isChangingPassword" @click="closePasswordDialog">

                                <X class="
                                        h-3.5
                                        w-3.5
                                    " />

                                Cancel

                            </button>


                            <!-- Change password -->

                            <button type="submit" class="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-[#111111]
                                    px-5
                                    py-2.5
                                    text-[11px]
                                    font-bold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-slate-800
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                " :disabled="isChangingPassword ||
                                    !passwordForm.currentPassword ||
                                    !passwordForm.newPassword ||
                                    !passwordForm.confirmPassword ||
                                    !!passwordErrors.currentPassword ||
                                    !!passwordErrors.newPassword ||
                                    !!passwordErrors.confirmPassword
                                    ">

                                <Loader2 v-if="isChangingPassword" class="
                                        h-3.5
                                        w-3.5
                                        animate-spin
                                    " />


                                <Check v-else class="
                                        h-3.5
                                        w-3.5
                                    " />


                                {{
                                    isChangingPassword
                                        ? "Changing..."
                                        : "Change Password"
                                }}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </Transition>

    </Teleport>

</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>