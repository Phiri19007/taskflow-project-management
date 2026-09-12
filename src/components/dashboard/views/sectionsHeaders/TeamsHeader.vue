<script setup lang="ts">
import { ref } from "vue";
import { Users, FolderKanban } from "lucide-vue-next";

import AddButton from "@/components/AddButton.vue";
import { workspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/services/stores/workspace.store";
import { useToastStore } from "@/services/stores/toast.store";

const workspaceStore = useWorkspaceStore();
const toast = useToastStore();

const inviteState = ref({
    open: false,
    email: "",
    loading: false,
    error: null as string | null,
});

function handleAddWorkspaceMember() {
    const workspace = workspaceStore.currentWorkspace;

    // User does not belong to / have a workspace
    if (!workspace) {
        toast.error(
            "You don't have a workspace yet. Please create a workspace before adding members."
        );

        return;
    }

    // User has a workspace, so open the invite dialog
    inviteState.value = {
        open: true,
        email: "",
        loading: false,
        error: null,
    };
}

function closeInviteDialog() {
    if (inviteState.value.loading) {
        return;
    }

    inviteState.value.open = false;
    inviteState.value.error = null;
}

async function inviteMember() {
    const workspace = workspaceStore.currentWorkspace;

    if (!workspace) {
        inviteState.value.error =
            "You don't have a workspace yet. Please create a workspace before inviting members.";

        return;
    }

    const email = inviteState.value.email.trim();

    if (!email) {
        inviteState.value.error =
            "Please enter an email address.";

        return;
    }

    inviteState.value.loading = true;
    inviteState.value.error = null;

    try {
        await workspaceService.invite(
            workspace.id,
            email,
        );

        inviteState.value.open = false;
        inviteState.value.email = "";

        toast.success(
            "Invitation sent successfully.",
        );
    } catch (error: any) {
        toast.error(
            "Failed to invite workspace member.",
        );

        inviteState.value.error =
            error?.response?.data?.message ||
            "Failed to send invitation.";
    } finally {
        inviteState.value.loading = false;
    }
}
</script>

<template>
    <!-- Header Section -->
    <div
        class="flex items-center justify-between border-b border-slate-200/60 pb-5 shrink-0"
    >
        <div>
            <h1
                class="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"
            >
                <FolderKanban class="w-5 h-5 text-slate-600" />

                Project Team Summaries
            </h1>

            <p
                class="text-[12px] text-slate-400 font-medium mt-0.5"
            >
                High-level status, cross-functional team sizes,
                and progress tracking per project.
            </p>
        </div>

        <!-- Add workspace member -->
        <div class="flex items-center">
            <AddButton
                @click="handleAddWorkspaceMember"
                label="Add workspace member"
            />
        </div>

        <!-- Invite dialog -->
        <div
            v-if="inviteState.open"
            class="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
            <!-- Backdrop -->
            <div
                class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
                @click="closeInviteDialog"
            ></div>

            <!-- Dialog -->
            <div
                class="relative z-10 w-full max-w-110 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)]"
            >
                <!-- Header -->
                <div
                    class="border-b border-slate-100 px-6 py-5"
                >
                    <div class="flex items-start justify-between">
                        <div class="flex items-start gap-3">
                            <!-- Icon -->
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"
                            >
                                <Users
                                    class="h-4.5 w-4.5 text-slate-700"
                                />
                            </div>

                            <div>
                                <h2
                                    class="text-[15px] font-bold tracking-tight text-slate-900"
                                >
                                    Add workspace member
                                </h2>

                                <p
                                    class="mt-1 text-[12px] leading-5 text-slate-400"
                                >
                                    Invite someone to collaborate
                                    in this workspace.
                                </p>
                            </div>
                        </div>

                        <!-- Close -->
                        <button
                            type="button"
                            :disabled="inviteState.loading"
                            class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                            @click="closeInviteDialog"
                        >
                            <span class="text-lg leading-none">
                                ×
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Body -->
                <div class="px-6 py-6">
                    <!-- Error -->
                    <div
                        v-if="inviteState.error"
                        class="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3"
                    >
                        <div
                            class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                        >
                            !
                        </div>

                        <p
                            class="text-[12px] font-medium leading-5 text-red-600"
                        >
                            {{ inviteState.error }}
                        </p>
                    </div>

                    <!-- Email -->
                    <div>
                        <label
                            for="member-email"
                            class="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500"
                        >
                            Email address
                        </label>

                        <input
                            id="member-email"
                            v-model="inviteState.email"
                            type="email"
                            placeholder="member@example.com"
                            autocomplete="email"
                            :disabled="inviteState.loading"
                            class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[13px] font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:opacity-60"
                            @keyup.enter="inviteMember"
                        />

                        <p
                            class="mt-2 text-[11px] text-slate-400"
                        >
                            The user must already have a TaskFlow account.
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4"
                >
                    <!-- Cancel -->
                    <button
                        type="button"
                        :disabled="inviteState.loading"
                        class="h-9 rounded-lg px-4 text-[12px] font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        @click="closeInviteDialog"
                    >
                        Cancel
                    </button>

                    <!-- Invite -->
                    <button
                        type="button"
                        :disabled="
                            !inviteState.email.trim() ||
                            inviteState.loading
                        "
                        class="inline-flex h-9 items-center gap-2 rounded-lg bg-[#111111] px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        @click="inviteMember"
                    >
                        <!-- Loading -->
                        <svg
                            v-if="inviteState.loading"
                            class="h-3.5 w-3.5 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="3"
                            />

                            <path
                                class="opacity-90"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                            />
                        </svg>

                        <span>
                            {{
                                inviteState.loading
                                    ? "Sending..."
                                    : "Send invitation"
                            }}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
