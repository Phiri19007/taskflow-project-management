
// stores/app.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";

import { useAuthStore } from "./auth.store";
import { useWorkspaceStore } from "./workspace.store";
import { useProjectStore } from "./project.store";
import { useTaskStore } from "./task.store";
import { useNotificationStore } from "./notification.store";
import { useWorkspaceMemberStore } from "./workspace-member.store";

export const useAppStore = defineStore("app", () => {

    const loading = ref(false);
    const initialized = ref(false);
    const error = ref<string | null>(null);


    async function initializeDashboard() {

        if (initialized.value) {
            return;
        }

        await loadDashboard();
    }


    /*
     * Actual dashboard loading logic.
     *
     * This can be called both during initial
     * application startup and after accepting
     * a workspace invitation.
     */
    async function loadDashboard() {

        loading.value = true;
        error.value = null;

        try {

            const authStore =
                useAuthStore();

            const workspaceStore =
                useWorkspaceStore();

            const projectStore =
                useProjectStore();

            const taskStore =
                useTaskStore();

            const notificationStore =
                useNotificationStore();

            const workspaceMemberStore =
                useWorkspaceMemberStore();


            /*
             * 1. Load current user
             */
            await authStore.fetchCurrentUser();


            /*
             * 2. Load notifications
             */
            await notificationStore.fetchNotifications();


            /*
             * 3. Reload user's workspaces
             *
             * This is important after accepting
             * an invitation because the backend has
             * now created the WorkspaceMember.
             */
            const selectedWorkspaceId =
                workspaceStore.currentWorkspace?.id;

            await workspaceStore.fetchMyWorkspaces();


            /*
             * Restore the workspace that was selected
             * before refreshing the workspace list.
             */
            if (selectedWorkspaceId) {

                const selectedWorkspace =
                    workspaceStore.workspaces.find(
                        workspace =>
                            workspace.id === selectedWorkspaceId
                    );

                if (selectedWorkspace) {

                    workspaceStore.setCurrentWorkspace(
                        selectedWorkspace
                    );

                }

            }


            const workspace =
                workspaceStore.currentWorkspace;


            /*
             * User may still have no workspace.
             */
            if (!workspace) {

                console.warn(
                    "No workspace found. Skipping workspace resources loading."
                );

                initialized.value = true;

                return;
            }


            const workspaceId =
                workspace.id;


            /*
             * 4. Load workspace resources
             */
            await Promise.all([

                projectStore.fetchProjects(
                    workspaceId
                ),

                workspaceMemberStore.fetchMembers(
                    workspaceId
                ),

            ]);


            /*
             * 5. Load tasks
             */
            const projectIds =
                projectStore.projects.map(
                    project => project.id
                );


            await Promise.all(

                projectIds.map(
                    projectId =>
                        taskStore.fetchTasks(
                            projectId
                        )
                )

            );


            initialized.value = true;


        } catch (err: any) {

            error.value =
                err.message ||
                "Dashboard loading failed";

            throw err;

        } finally {

            loading.value = false;

        }
    }


    /*
     * Force a complete dashboard refresh.
     *
     * Used after actions that change the user's
     * workspace membership.
     */
    async function refreshDashboard() {

        initialized.value = false;

        await loadDashboard();
    }


    async function initializeWorkspace() {

        const authStore =
            useAuthStore();

        const workspaceStore =
            useWorkspaceStore();


        await authStore.fetchCurrentUser();

        await workspaceStore.fetchMyWorkspaces();

    }


    function clearAppData() {

        const authStore =
            useAuthStore();

        const workspaceStore =
            useWorkspaceStore();

        const projectStore =
            useProjectStore();

        const taskStore =
            useTaskStore();

        const notificationStore =
            useNotificationStore();

        const workspaceMemberStore =
            useWorkspaceMemberStore();


        /*
         * Clear authentication state
         */
        authStore.clear();


        /*
         * Clear workspace state
         */
        workspaceStore.clear();


        /*
         * Clear projects
         */
        projectStore.clear();


        /*
         * Clear tasks
         */
        taskStore.clear();


        /*
         * Clear notifications
         */
        notificationStore.clear();


        /*
         * Clear workspace members
         */
        workspaceMemberStore.clear();


        /*
         * Reset app initialization state
         */
        initialized.value = false;
        loading.value = false;
        error.value = null;
    }




    return {

        loading,

        initialized,

        error,

        initializeDashboard,

        refreshDashboard,

        initializeWorkspace,
        clearAppData,

    };

});

