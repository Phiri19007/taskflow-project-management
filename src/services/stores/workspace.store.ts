import { defineStore } from "pinia";
import { ref } from "vue";
import { workspaceService } from "@/services/workspace.service";
import type { Workspace } from "@/types/workspace";

export const useWorkspaceStore = defineStore("workspace", () => {

    const workspaces =
        ref<Workspace[]>([]);

    const currentWorkspace =
        ref<Workspace | null>(null);


    /*
    |--------------------------------------------------------------------------
    | Fetch My Workspaces
    |--------------------------------------------------------------------------
    */

    async function fetchMyWorkspaces() {

        const { data } =
            await workspaceService.getMine();


        workspaces.value = data;


        if (data.length > 0) {
            currentWorkspace.value = data[0];
        }

    }


    /*
    |--------------------------------------------------------------------------
    | Fetch Current Workspace
    |--------------------------------------------------------------------------
    */

    async function fetchCurrentWorkspace() {

        if (!currentWorkspace.value) {
            return null;
        }


        const { data } =
            await workspaceService.getById(
                currentWorkspace.value.id,
            );


        currentWorkspace.value = data;


        return data;
    }


    /*
    |--------------------------------------------------------------------------
    | Set Current Workspace
    |--------------------------------------------------------------------------
    */

    function setCurrentWorkspace(
        workspace: Workspace,
    ) {
        currentWorkspace.value = workspace;
    }

    async function deleteWorkspace(id: number) {

    await workspaceService.delete(id);

    /*
     * Remove the workspace from the local list.
     */
    workspaces.value =
        workspaces.value.filter(
            workspace =>
                workspace.id !== id
        );


    /*
     * If the deleted workspace was the
     * current workspace, select another one.
     */
    if (
        currentWorkspace.value?.id === id
    ) {

        const nextWorkspace =
            workspaces.value[0];


        if (nextWorkspace) {

            currentWorkspace.value =
                nextWorkspace;

        } else {

            currentWorkspace.value =
                null;

        }

    }
}


    /*
    |--------------------------------------------------------------------------
    | Clear
    |--------------------------------------------------------------------------
    */

    function clear() {

        workspaces.value = [];

        currentWorkspace.value = null;

    }


    return {
        workspaces,
        currentWorkspace,

        fetchMyWorkspaces,
        fetchCurrentWorkspace,
        deleteWorkspace,
        setCurrentWorkspace,
        clear,
    };

});
