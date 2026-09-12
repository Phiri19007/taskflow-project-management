import { defineStore } from "pinia";
import { ref } from "vue";

import { workspaceMemberService } from "@/services/workspace-member.service";

import {
    WorkspaceRole,
    type WorkspaceMember,
} from "@/types/workspace-member";


export const useWorkspaceMemberStore = defineStore(
    "workspaceMembers",
    () => {

        const members =
            ref<WorkspaceMember[]>([]);

        const loading =
            ref(false);

        const error =
            ref<string | null>(null);


        /*
        |--------------------------------------------------------------------------
        | Fetch members
        |--------------------------------------------------------------------------
        */

        async function fetchMembers(
            workspaceId: number
        ) {

            try {

                loading.value = true;

                error.value = null;


                const { data } =
                    await workspaceMemberService.getMembers(
                        workspaceId.toString()
                    );


                members.value = data;


            } catch (err: any) {

                error.value =
                    err?.message ||
                    "Failed to load workspace members";


                throw err;


            } finally {

                loading.value = false;

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Invite member
        |--------------------------------------------------------------------------
        */

        async function inviteMember(
            workspaceId: number,
            payload: any
        ) {

            const { data } =
                await workspaceMemberService.invite(
                    workspaceId.toString(),
                    payload
                );


            members.value.push(data);

            return data;

        }


        /*
        |--------------------------------------------------------------------------
        | Update member role
        |--------------------------------------------------------------------------
        */

        async function updateMemberRole(
            workspaceId: number,
            memberId: number,
            role: WorkspaceRole
        ) {

            const { data } =
                await workspaceMemberService.updateRole(
                    workspaceId.toString(),
                    memberId.toString(),
                    {
                        role,
                    }
                );


            /*
             * Update the member inside Pinia
             * without fetching the whole list again.
             */

            const index =
                members.value.findIndex(
                    member =>
                        member.id === memberId
                );


            if (index !== -1) {

                members.value[index] = data;

            }


            return data;

        }


        /*
        |--------------------------------------------------------------------------
        | Remove member
        |--------------------------------------------------------------------------
        */

        async function removeMember(
            workspaceId: number,
            memberId: number
        ) {

            await workspaceMemberService.remove(
                workspaceId.toString(),
                memberId.toString()
            );


            members.value =
                members.value.filter(
                    member =>
                        member.id !== memberId
                );

        }


        /*
        |--------------------------------------------------------------------------
        | Clear
        |--------------------------------------------------------------------------
        */

        function clear() {

            members.value = [];

            error.value = null;

        }


        /*
        |--------------------------------------------------------------------------
        | Store API
        |--------------------------------------------------------------------------
        */

        return {

            members,

            loading,

            error,

            fetchMembers,

            inviteMember,

            updateMemberRole,

            removeMember,

            clear,

        };

    }
);
