import { defineStore } from "pinia";
import { ref } from "vue";

import { userService } from "@/services/user.service";

import type { User } from "@/types/user";


export const useAuthStore = defineStore(
    "auth",
    () => {

        const user =
            ref<User | null>(null);


        /*
         * Fetch currently authenticated user
         */
        async function fetchCurrentUser() {

            const { data } =
                await userService.getCurrentUser();

            user.value = data;

        }


        /*
         * Update current user's profile
         */
        async function updateProfile(
            payload: {
                fullName: string;
            }
        ) {

            const { data } =
                await userService.updateProfile(
                    payload
                );

            user.value = data;

            return data;

        }

async function updateAvatar(
    file: File
) {
    const formData = new FormData();

    formData.append(
        "avatar",
        file
    );

    const { data } =
        await userService.updateAvatar(
            formData
        );

    user.value = data;
}


    async function changePassword(payload: {
        currentPassword: string;
        newPassword: string;
    }) {

        return await userService.changePassword(
            payload
        );
    }

        /*
         * Clear authentication state
         */
        function clear() {

            user.value = null;

        }


        return {

            user,

            fetchCurrentUser,

            updateProfile,
            updateAvatar,
            changePassword,
            clear,

        };

    }
);