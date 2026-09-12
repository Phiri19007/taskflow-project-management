<script setup lang="ts">

import {
    Bell,
} from "lucide-vue-next";

import {
    useNotificationStore,
} from "@/services/stores/notification.store";

import {
    useToastStore,
} from "@/services/stores/toast.store";


const toast =
    useToastStore();


const notificationStore =
    useNotificationStore();


async function markAllNotificationsAsRead() {

    try {

        await notificationStore.markAllAsRead();

        toast.success(
            "All notifications marked as read.",
        );

    } catch (error) {

        console.error(error);

        toast.error(
            "Failed to mark notifications as read.",
        );

    }

}

</script>


<template>

    <div
        class="flex items-center justify-between border-b border-slate-200/60 pb-4 shrink-0"
    >

        <div>

            <h1
                class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"
            >

                <Bell
                    class="w-5 h-5 text-slate-700"
                />

                Notifications Center

            </h1>


            <p
                class="text-[12px] text-slate-400 font-medium"
            >
                Review broadcast alerts, performance warnings,
                and systemic updates.
            </p>

        </div>


        <button
            type="button"
            :disabled="
                notificationStore.unreadCount === 0
            "
            class="text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-3 py-1 cursor-pointer
                disabled:cursor-not-allowed
                disabled:text-slate-400"
            @click="markAllNotificationsAsRead"
        >
            Mark all as read
        </button>

    </div>

</template>

