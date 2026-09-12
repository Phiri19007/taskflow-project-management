import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types/notification";

export const useNotificationStore = defineStore(
    "notifications",
    () => {

        /*
         * User notifications
         */
        const notifications =
            ref<Notification[]>([]);


        /*
         * Activity for the currently opened project
         */
        const projectActivity =
            ref<Notification[]>([]);


        /*
         * Load user's notifications
         */
        async function fetchNotifications() {

            const { data } =
                await notificationService.getMine();

            notifications.value = data;

        }


        /*
         * Load activity belonging to a project
         */
        async function fetchProjectActivity(
            projectId: number
        ) {

            const { data } =
                await notificationService.getProjectActivity(
                    projectId
                );

            projectActivity.value = data;

        }


        /*
         * Number of unread notifications
         */
        const unreadCount =
            computed(() =>
                notifications.value.filter(
                    notification =>
                        !notification.isRead
                ).length
            );


        /*
         * Mark one notification as read
         */
        async function markAsRead(
            notificationId: number
        ) {

            await notificationService.markAsRead(
                notificationId
            );


            const notification =
                notifications.value.find(
                    item =>
                        item.id === notificationId
                );


            if (notification) {

                notification.isRead = true;

            }

        }


        /*
         * Mark all notifications as read
         */
        async function markAllAsRead() {

            await notificationService.markAllAsRead();


            notifications.value.forEach(
                notification => {

                    notification.isRead = true;

                }
            );

        }


        /*
         * Clear notification/activity state
         */
        function clear() {

            notifications.value = [];

            projectActivity.value = [];

        }


        return {

            notifications,

            projectActivity,

            unreadCount,

            fetchNotifications,

            fetchProjectActivity,

            markAsRead,

            markAllAsRead,

            clear,

        };

    }
);