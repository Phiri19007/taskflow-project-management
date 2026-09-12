<script setup lang="ts">
import {
    Bell,
    Check,
    ExternalLink,
    FolderKanban,
    ListTodo,
    MessageCircle,
    Users,
    X,
} from "lucide-vue-next";

import NotificationHeader from "@/components/dashboard/views/sectionsHeaders/NotificationHeader.vue";

import { computed } from "vue";

import { useNotificationStore } from "@/services/stores/notification.store";
import { workspaceService } from "@/services/workspace.service";
import { useAppStore } from "@/services/stores/app.store";
import { useToastStore } from "@/services/stores/toast.store";


const notificationStore =
    useNotificationStore();


const notifications =
    computed(
        () => notificationStore.notifications
    );
const toast =
    useToastStore();

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatDate(date: string) {

    return new Date(date).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );

}


function formatTime(date: string) {

    return new Date(date).toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit",
        }
    );

}


function getNotificationIcon(type: string) {

    switch (type) {

        case "WORKSPACE_INVITE":
            return Users;

        case "TASK_ASSIGNED":
        case "TASK_COMPLETED":
        case "TASK_DUE":
            return ListTodo;

        case "TASK_COMMENT":
        case "TASK_MENTION":
            return MessageCircle;

        case "PROJECT_CREATED":
        case "PROJECT_UPDATED":
            return FolderKanban;

        case "MEMBER_JOINED":
            return Users;

        default:
            return Bell;

    }

}


function getNotificationTitle(
    notification: any
) {

    switch (notification.type) {

        case "WORKSPACE_INVITE":
            return "Workspace invitation";

        case "TASK_ASSIGNED":
            return "Task assigned";

        case "TASK_COMPLETED":
            return "Task completed";

        case "TASK_COMMENT":
            return "New comment";

        case "TASK_MENTION":
            return "You were mentioned";

        case "PROJECT_CREATED":
            return "Project created";

        case "PROJECT_UPDATED":
            return "Project updated";

        case "MEMBER_JOINED":
            return "New workspace member";

        case "TASK_DUE":
            return "Task due";

        default:
            return notification.title;

    }

}


function getNotificationMessage(
    notification: any
) {

    if (notification.message) {

        return notification.message;

    }


    switch (notification.type) {

        case "WORKSPACE_INVITE":
            return `${notification.actor?.fullName ?? "Someone"} invited you to join ${notification.workspace?.name ?? "this workspace"}.`;

        case "TASK_ASSIGNED":
            return "A task has been assigned to you.";

        case "TASK_COMPLETED":
            return "A task has been completed.";

        case "TASK_COMMENT":
            return "Someone commented on a task.";

        case "TASK_MENTION":
            return "You were mentioned in a task comment.";

        case "PROJECT_CREATED":
            return "A new project has been created.";

        case "PROJECT_UPDATED":
            return "A project has been updated.";

        case "MEMBER_JOINED":
            return "A new member joined the workspace.";

        case "TASK_DUE":
            return "A task is due soon.";

        default:
            return "";

    }

}


/*
|--------------------------------------------------------------------------
| Related data
|--------------------------------------------------------------------------
*/

function hasTask(
    notification: any
) {

    return !!notification.task;

}


function hasProject(
    notification: any
) {

    return !!notification.project;

}


function hasComment(
    notification: any
) {

    return !!notification.comment;

}


/*
|--------------------------------------------------------------------------
| Notification actions
|--------------------------------------------------------------------------
*/

/*
 * Only unread notifications can
 * trigger this action.
 */
async function markAsRead(
    notification: any
) {

    if (notification.isRead) {

        return;

    }


    try {

        await notificationStore.markAsRead(
            notification.id
        );

        toast.success(
            "Notification marked as read."
        );

    } catch (error) {

        console.error(
            "Failed to mark notification as read:",
            error
        );

        toast.error(
            "Failed to mark notification as read."
        );

    }

}


/*
 * Workspace invitation requires
 * an explicit Accept / Decline action.
 */
function requiresAction(
    notification: any
) {

    return (
        notification.type ===
        "WORKSPACE_INVITE" &&
        !notification.isRead
    );

}


/*
|--------------------------------------------------------------------------
| Accept workspace invitation
|--------------------------------------------------------------------------
*/

async function acceptWorkspaceInvite(
    notification: any
) {

    if (
        notification.type !==
        "WORKSPACE_INVITE"
    ) {

        return;

    }


    if (notification.isRead) {

        return;

    }


    try {

        /*
         * Accept invitation.
         */
        const workspaceMember =
            await workspaceService.acceptInvite(
                notification.workspace.id,
                notification.id
            );


        console.log(
            "Workspace member created:",
            workspaceMember
        );


        /*
         * Mark notification as read.
         */
        await notificationStore.markAsRead(
            notification.id
        );


        /*
         * Refresh application data.
         */
        const appStore =
            useAppStore();


        await appStore.refreshDashboard();


    } catch (error: any) {

        console.error(
            "Failed to accept workspace invite:",
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| Decline workspace invitation
|--------------------------------------------------------------------------
*/

async function declineWorkspaceInvite(
    notification: any
) {

    if (
        notification.type !==
        "WORKSPACE_INVITE"
    ) {

        return;

    }


    if (notification.isRead) {

        return;

    }


    /*
     * Add your decline API call here.
     */
    console.log(
        "Decline workspace invite:",
        notification
    );

}

</script>


<template>

    <main
        class="
            min-h-full
            flex-1
            overflow-y-auto
            bg-[#f4f7fa]
        "
    >
    <div
                    class="
                mx-auto
                w-full
                max-w-375
                px-4
                py-4
                sm:px-5
                lg:px-6
            "
                >
        <!-- Header -->

        <NotificationHeader />


        <!-- Notifications -->

        <div class="mx-auto w-full">


            <!-- ========================================= -->
            <!-- EMPTY STATE                               -->
            <!-- ========================================= -->

            <div
                v-if="notifications.length === 0"
                class="
                    flex
                    flex-col
                    items-center
                    justify-center
                    rounded-3xl
                    py-16
                    text-center
                    min-h-[60vh]
                "
            >

                <div
                    class="
                        mb-4
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-slate-100
                    "
                >

                    <Bell
                        class="
                            h-6
                            w-6
                            text-slate-400
                        "
                    />

                </div>


                <h3
                    class="
                        text-sm
                        font-bold
                        text-slate-900
                    "
                >
                    You're all caught up
                </h3>


                <p
                    class="
                        mt-1
                        max-w-sm
                        text-xs
                        leading-5
                        text-slate-400
                    "
                >
                    You don't have any notifications
                    at the moment.
                </p>

            </div>


            <!-- ========================================= -->
            <!-- NOTIFICATION LIST                         -->
            <!-- ========================================= -->

            <div
                v-else
                class="space-y-3 "
            >

                <article
                    v-for="notification in notifications"
                    :key="notification.id"

                    class="
                        group
                        overflow-hidden
                        rounded-2xl
                        border
                        transition-all
                        mt-5
                    "

                    :class="notification.isRead
                        ? [
                            'border-slate-200/70',
                            'bg-white'
                        ]
                        : [
                            'border-slate-200',
                            'bg-white',
                            'cursor-pointer',
                            'shadow-sm',
                            'hover:border-slate-300',
                            'hover:shadow-md'
                        ]
                    "

                   
                    @click="
                        !notification.isRead &&
                        markAsRead(notification)
                    "
                >


                    <!-- ================================= -->
                    <!-- MAIN NOTIFICATION                  -->
                    <!-- ================================= -->

                    <div class="flex gap-4 p-5">


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
                            "

                            :class="notification.isRead
                                ? 'bg-slate-100 text-slate-400'
                                : 'bg-slate-900 text-white'
                            "
                        >

                            <component
                                :is="
                                    getNotificationIcon(
                                        notification.type
                                    )
                                "
                                class="
                                    h-4.5
                                    w-4.5
                                "
                            />

                        </div>


                        <!-- Content -->

                        <div class="min-w-0 flex-1">


                            <!-- ================================= -->
                            <!-- TITLE / DATE                       -->
                            <!-- ================================= -->

                            <div
                                class="
                                    flex
                                    items-start
                                    justify-between
                                    gap-4
                                "
                            >

                                <div>

                                    <div
                                        class="
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <h3
                                            class="
                                                text-sm
                                                font-bold
                                                text-slate-900
                                            "
                                        >
                                            {{
                                                getNotificationTitle(
                                                    notification
                                                )
                                            }}
                                        </h3>


                                        <!-- Unread indicator -->

                                        <span
                                            v-if="
                                                !notification.isRead
                                            "
                                            class="
                                                h-1.5
                                                w-1.5
                                                rounded-full
                                                bg-[#ff1e5e]
                                            "
                                        ></span>

                                    </div>


                                    <p
                                        class="
                                            mt-1
                                            text-xs
                                            text-slate-400
                                        "
                                    >

                                        {{
                                            notification
                                                .workspace
                                                ?.name
                                        }}


                                        <span
                                            v-if="
                                                notification.actor
                                            "
                                        >
                                            ·
                                            {{
                                                notification
                                                    .actor
                                                    .fullName
                                            }}
                                        </span>

                                    </p>

                                </div>


                                <!-- Date -->

                                <div
                                    class="
                                        shrink-0
                                        text-right
                                    "
                                >

                                    <p
                                        class="
                                            text-[11px]
                                            font-medium
                                            text-slate-400
                                        "
                                    >
                                        {{
                                            formatDate(
                                                notification.createdAt
                                            )
                                        }}
                                    </p>


                                    <p
                                        class="
                                            mt-0.5
                                            text-[10px]
                                            text-slate-300
                                        "
                                    >
                                        {{
                                            formatTime(
                                                notification.createdAt
                                            )
                                        }}
                                    </p>

                                </div>

                            </div>


                            <!-- ================================= -->
                            <!-- MESSAGE                            -->
                            <!-- ================================= -->

                            <p
                                class="
                                    mt-3
                                    text-sm
                                    leading-6
                                    text-slate-600
                                "
                            >
                                {{
                                    getNotificationMessage(
                                        notification
                                    )
                                }}
                            </p>


                            <!-- ================================= -->
                            <!-- TASK CARD                          -->
                            <!-- ================================= -->

                            <div
                                v-if="
                                    hasTask(
                                        notification
                                    )
                                "
                                class="
                                    mt-4
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                "
                            >

                                <div
                                    class="
                                        flex
                                        items-start
                                        gap-3
                                    "
                                >

                                    <div
                                        class="
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-lg
                                            bg-white
                                            text-slate-500
                                            shadow-sm
                                        "
                                    >

                                        <ListTodo
                                            class="
                                                h-4
                                                w-4
                                            "
                                        />

                                    </div>


                                    <div
                                        class="
                                            min-w-0
                                            flex-1
                                        "
                                    >

                                        <p
                                            class="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            "
                                        >
                                            Task
                                        </p>


                                        <p
                                            class="
                                                mt-1
                                                truncate
                                                text-sm
                                                font-bold
                                                text-slate-800
                                            "
                                        >
                                            {{
                                                notification
                                                    .task
                                                    ?.title
                                            }}
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        class="
                                            rounded-lg
                                            p-2
                                            text-slate-400
                                            transition
                                            hover:bg-white
                                            hover:text-slate-900
                                        "
                                        @click.stop
                                    >

                                        <ExternalLink
                                            class="
                                                h-3.5
                                                w-3.5
                                            "
                                        />

                                    </button>

                                </div>

                            </div>


                            <!-- ================================= -->
                            <!-- PROJECT CARD                       -->
                            <!-- ================================= -->

                            <div
                                v-if="
                                    hasProject(
                                        notification
                                    )
                                "
                                class="
                                    mt-4
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                "
                            >

                                <div
                                    class="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <div
                                        class="
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-lg
                                            bg-white
                                            text-slate-500
                                            shadow-sm
                                        "
                                    >

                                        <FolderKanban
                                            class="
                                                h-4
                                                w-4
                                            "
                                        />

                                    </div>


                                    <div
                                        class="min-w-0"
                                    >

                                        <p
                                            class="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            "
                                        >
                                            Project
                                        </p>


                                        <p
                                            class="
                                                mt-1
                                                truncate
                                                text-sm
                                                font-bold
                                                text-slate-800
                                            "
                                        >
                                            {{
                                                notification
                                                    .project
                                                    ?.name
                                            }}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <!-- ================================= -->
                            <!-- COMMENT CARD                       -->
                            <!-- ================================= -->

                            <div
                                v-if="
                                    hasComment(
                                        notification
                                    )
                                "
                                class="
                                    mt-4
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                "
                            >

                                <div
                                    class="
                                        flex
                                        gap-3
                                    "
                                >

                                    <div
                                        class="
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-lg
                                            bg-white
                                            text-slate-500
                                            shadow-sm
                                        "
                                    >

                                        <MessageCircle
                                            class="
                                                h-4
                                                w-4
                                            "
                                        />

                                    </div>


                                    <div
                                        class="min-w-0"
                                    >

                                        <p
                                            class="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            "
                                        >
                                            Comment
                                        </p>


                                        <p
                                            class="
                                                mt-1
                                                text-sm
                                                leading-5
                                                text-slate-600
                                            "
                                        >
                                            {{
                                                notification
                                                    .comment
                                                    ?.message
                                            }}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <!-- ================================= -->
                            <!-- WORKSPACE INVITATION               -->
                            <!-- ================================= -->

                            <div
                                v-if="
                                    requiresAction(
                                        notification
                                    )
                                "
                                class="
                                    mt-4
                                    flex
                                    items-center
                                    justify-between
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                "
                            >

                                <div
                                    class="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <div
                                        class="
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-lg
                                            bg-white
                                            text-slate-500
                                            shadow-sm
                                        "
                                    >

                                        <Users
                                            class="
                                                h-4
                                                w-4
                                            "
                                        />

                                    </div>


                                    <div>

                                        <p
                                            class="
                                                text-xs
                                                font-bold
                                                text-slate-800
                                            "
                                        >
                                            Join workspace?
                                        </p>


                                        <p
                                            class="
                                                mt-0.5
                                                text-[11px]
                                                text-slate-400
                                            "
                                        >
                                            Accept the invitation
                                            to become a member.
                                        </p>

                                    </div>

                                </div>


                                <!-- Actions -->

                                <div
                                    class="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <!-- Decline -->

                                    <button
                                        type="button"
                                        class="
                                            flex
                                            items-center
                                            gap-1.5
                                            rounded-lg
                                            border
                                            border-slate-200
                                            bg-white
                                            px-3
                                            py-2
                                            text-xs
                                            font-semibold
                                            text-slate-500
                                            transition
                                            hover:border-red-200
                                            hover:bg-red-50
                                            hover:text-red-600
                                        "
                                        @click.stop="
                                            declineWorkspaceInvite(
                                                notification
                                            )
                                        "
                                    >

                                        <X
                                            class="
                                                h-3.5
                                                w-3.5
                                            "
                                        />

                                        Decline

                                    </button>


                                    <!-- Accept -->

                                    <button
                                        type="button"
                                        class="
                                            flex
                                            items-center
                                            gap-1.5
                                            rounded-lg
                                            bg-[#111111]
                                            px-3
                                            py-2
                                            text-xs
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-slate-800
                                        "
                                        @click.stop="
                                            acceptWorkspaceInvite(
                                                notification
                                            )
                                        "
                                    >

                                        <Check
                                            class="
                                                h-3.5
                                                w-3.5
                                            "
                                        />

                                        Accept

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </article>

            </div>

        </div>
    </div>

    </main>

</template>