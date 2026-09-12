<script setup lang="ts">
import {
  computed,
  ref,
} from "vue";

import {
  Check,
  Loader2,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-vue-next";

import { useWorkspaceMemberStore } from "@/services/stores/workspace-member.store";
import { useWorkspaceStore } from "@/services/stores/workspace.store";

import {
  WorkspaceRole,
  type WorkspaceMember,
} from "@/types/workspace-member";


/*
|--------------------------------------------------------------------------
| Stores
|--------------------------------------------------------------------------
*/

const workspaceStore = useWorkspaceStore();
const memberStore = useWorkspaceMemberStore();


/*
|--------------------------------------------------------------------------
| UI State
|--------------------------------------------------------------------------
*/

const searchQuery = ref("");

/*
|--------------------------------------------------------------------------
| Delete modal
|--------------------------------------------------------------------------
*/

const showDeleteModal = ref(false);

const selectedMember =
  ref<WorkspaceMember | null>(null);

const deleting = ref(false);

const deleteError =
  ref<string | null>(null);


/*
|--------------------------------------------------------------------------
| Role modal
|--------------------------------------------------------------------------
*/

const showRoleModal = ref(false);

const selectedRoleMember =
  ref<WorkspaceMember | null>(null);

const selectedRole =
  ref<WorkspaceRole | null>(null);

const updatingRole = ref(false);

const roleError =
  ref<string | null>(null);


/*
|--------------------------------------------------------------------------
| Workspace
|--------------------------------------------------------------------------
*/

const workspaceId = computed<
  number | undefined
>(() => {
  return workspaceStore.currentWorkspace?.id;
});


/*
|--------------------------------------------------------------------------
| Filtered members
|--------------------------------------------------------------------------
*/

const filteredMembers =
  computed<WorkspaceMember[]>(() => {

    const query =
      searchQuery.value
        .trim()
        .toLowerCase();

    if (!query) {
      return memberStore.members;
    }

    return memberStore.members.filter(
      (member: WorkspaceMember) => {

        const fullName =
          member.user?.fullName
            ?.toLowerCase() ?? "";

        const email =
          member.user?.email
            ?.toLowerCase() ?? "";

        const role =
          member.role
            ?.toLowerCase() ?? "";

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          role.includes(query)
        );
      }
    );
  });


/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

const totalMembers =
  computed(() => {
    return memberStore.members.length;
  });


const adminCount =
  computed(() => {

    return memberStore.members.filter(
      (member: WorkspaceMember) =>
        member.role === WorkspaceRole.Admin
    ).length;

  });


const ownerCount =
  computed(() => {

    return memberStore.members.filter(
      (member: WorkspaceMember) =>
        member.role === WorkspaceRole.Owner
    ).length;

  });


/*
|--------------------------------------------------------------------------
| Remove member
|--------------------------------------------------------------------------
*/

function openDeleteModal(
  member: WorkspaceMember
) {

  selectedMember.value = member;

  deleteError.value = null;

  showDeleteModal.value = true;
}


function closeDeleteModal() {

  if (deleting.value) {
    return;
  }

  showDeleteModal.value = false;

  selectedMember.value = null;

  deleteError.value = null;
}


async function confirmRemoveMember() {

  if (
    !workspaceId.value ||
    !selectedMember.value
  ) {
    return;
  }

  deleting.value = true;

  deleteError.value = null;

  try {

    await memberStore.removeMember(
      workspaceId.value,
      selectedMember.value.id
    );

    showDeleteModal.value = false;

    selectedMember.value = null;

  } catch (err: any) {

    deleteError.value =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to remove member.";

  } finally {

    deleting.value = false;

  }
}


/*
|--------------------------------------------------------------------------
| Role management
|--------------------------------------------------------------------------
*/

function openRoleModal(
  member: WorkspaceMember
) {

  // Owner cannot be changed.
  if (member.role === WorkspaceRole.Owner) {
    return;
  }

  selectedRoleMember.value = member;

  selectedRole.value = member.role;

  roleError.value = null;

  showRoleModal.value = true;
}


function closeRoleModal() {

  if (updatingRole.value) {
    return;
  }

  showRoleModal.value = false;

  selectedRoleMember.value = null;

  selectedRole.value = null;

  roleError.value = null;
}


async function confirmRoleUpdate() {

  if (
    !workspaceId.value ||
    !selectedRoleMember.value ||
    !selectedRole.value
  ) {
    return;
  }

  const member =
    selectedRoleMember.value;

  const role =
    selectedRole.value;

  // Nothing changed.
  if (member.role === role) {
    closeRoleModal();
    return;
  }

  const previousRole =
    member.role;

  updatingRole.value = true;

  roleError.value = null;

  try {

    // Optimistically update UI.
    member.role = role;

    await memberStore.updateMemberRole(
      workspaceId.value,
      member.id,
      role
    );

    showRoleModal.value = false;

    selectedRoleMember.value = null;

    selectedRole.value = null;

  } catch (err: any) {

    // Restore previous role if API fails.
    member.role = previousRole;

    roleError.value =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to update member role.";

  } finally {

    updatingRole.value = false;

  }
}


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getInitials(
  member: WorkspaceMember
): string {

  const fullName =
    member.user?.fullName ||
    "User";

  return fullName
    .split(" ")
    .filter(Boolean)
    .map(
      (part: string) =>
        part.charAt(0)
    )
    .join("")
    .substring(0, 2)
    .toUpperCase();
}


function formatRole(
  role: WorkspaceRole
): string {

  switch (role) {

    case WorkspaceRole.Owner:
      return "Owner";

    case WorkspaceRole.Admin:
      return "Admin";

    case WorkspaceRole.Member:
      return "Member";

    case WorkspaceRole.Guest:
      return "Guest";

    default:
      return "Member";
  }
}


function formatDate(
  date: string
): string {

  if (!date) {
    return "-";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(parsedDate);
}


function roleClasses(
  role: WorkspaceRole
): string {

  switch (role) {

    case WorkspaceRole.Owner:

      return [
        "bg-orange-50",
        "text-orange-600",
      ].join(" ");

    case WorkspaceRole.Admin:

      return [
        "bg-purple-50",
        "text-purple-600",
      ].join(" ");

    case WorkspaceRole.Member:

      return [
        "bg-blue-50",
        "text-blue-600",
      ].join(" ");

    case WorkspaceRole.Guest:

      return [
        "bg-slate-50",
        "text-slate-600",
      ].join(" ");

    default:

      return [
        "bg-slate-50",
        "text-slate-600",
      ].join(" ");
  }
}


function roleDotClasses(
  role: WorkspaceRole
): string {

  switch (role) {

    case WorkspaceRole.Owner:
      return "bg-orange-500";

    case WorkspaceRole.Admin:
      return "bg-purple-500";

    case WorkspaceRole.Member:
      return "bg-blue-500";

    case WorkspaceRole.Guest:
      return "bg-slate-400";

    default:
      return "bg-slate-400";
  }
}


function canRemove(
  member: WorkspaceMember
): boolean {

  return (
    member.role !== WorkspaceRole.Owner
  );
}

</script>


<template>

  <!--
  ============================================================================
  PAGE
  ============================================================================
  -->

  <div
    class="
      mx-auto
      w-full
      max-w-6xl
      px-4
      py-6
      sm:px-6
      lg:px-8
      lg:py-8
    "
  >

    <!--
    ==========================================================================
    HEADER
    ==========================================================================
    -->

    <div
      class="
        mb-6
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >

      <div>

        <div
          class="
            flex
            items-center
            gap-2.5
          "
        >

          <div
            class="
              flex
              h-8
              w-8
              items-center
              justify-center
              text-blue-500
            "
          >

            <Users
              :size="19"
              :stroke-width="2"
            />

          </div>


          <h1
            class="
              text-xl
              font-semibold
              tracking-tight
              text-slate-800
            "
          >
            Workspace Members
          </h1>

        </div>


        <p
          class="
            mt-1.5
            pl-10
            text-xs
            text-slate-400
          "
        >
          Manage your workspace members,
          roles, and access.
        </p>

      </div>

    </div>


    <!--
    ==========================================================================
    ERROR
    ==========================================================================
    -->

    <div
      v-if="memberStore.error"
      class="
        mb-5
        rounded-lg
        border
        border-red-200
        bg-red-50
        px-4
        py-3
        text-xs
        text-red-600
      "
    >

      {{ memberStore.error }}

    </div>


    <!--
    ==========================================================================
    SUMMARY CARDS
    ==========================================================================
    -->

    <div
      class="
        mb-5
        grid
        grid-cols-1
        gap-3
        sm:grid-cols-3
      "
    >

      <!-- Total members -->

      <div
        class="
          flex
          min-h-19.5
          items-center
          gap-3
          rounded-xl
          border
          border-slate-200/80
          bg-white
          px-4
          py-4
          shadow-sm
        "
      >

        <div
          class="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-blue-50
            text-blue-600
          "
        >

          <Users :size="18" />

        </div>


        <div>

          <p
            class="
              mb-0.5
              text-[11px]
              text-slate-400
            "
          >
            Total members
          </p>


          <p
            class="
              text-lg
              font-semibold
              text-slate-800
            "
          >
            {{ totalMembers }}
          </p>

        </div>

      </div>


      <!-- Administrators -->

      <div
        class="
          flex
          min-h-19.5
          items-center
          gap-3
          rounded-xl
          border
          border-slate-200/80
          bg-white
          px-4
          py-4
          shadow-sm
        "
      >

        <div
          class="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-purple-50
            text-purple-600
          "
        >

          <Shield :size="18" />

        </div>


        <div>

          <p
            class="
              mb-0.5
              text-[11px]
              text-slate-400
            "
          >
            Administrators
          </p>


          <p
            class="
              text-lg
              font-semibold
              text-slate-800
            "
          >
            {{ adminCount }}
          </p>

        </div>

      </div>


      <!-- Owner -->

      <div
        class="
          flex
          min-h-19.5
          items-center
          gap-3
          rounded-xl
          border
          border-slate-200/80
          bg-white
          px-4
          py-4
          shadow-sm
        "
      >

        <div
          class="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-emerald-50
            text-emerald-600
          "
        >

          <Check :size="18" />

        </div>


        <div>

          <p
            class="
              mb-0.5
              text-[11px]
              text-slate-400
            "
          >
            Workspace owner
          </p>


          <p
            class="
              text-lg
              font-semibold
              text-slate-800
            "
          >
            {{ ownerCount }}
          </p>

        </div>

      </div>

    </div>


    <!--
    ==========================================================================
    MEMBERS CARD
    ==========================================================================
    -->

    <section
      class="
        overflow-hidden
        rounded-xl
        border
        border-slate-200/80
        bg-white
        shadow-sm
      "
    >

      <!-- Card header -->

      <div
        class="
          flex
          flex-col
          gap-4
          border-b
          border-slate-100
          px-5
          py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <h2
            class="
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Members
          </h2>


          <p
            class="
              mt-1
              text-[11px]
              text-slate-400
            "
          >
            People who have access to
            this workspace.
          </p>

        </div>


        <!-- Search -->

        <div
          class="
            flex
            h-9
            w-full
            items-center
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            px-2.5
            transition
            focus-within:border-blue-300
            focus-within:bg-white
            focus-within:ring-3
            focus-within:ring-blue-50
            sm:w-56
          "
        >

          <Search
            :size="15"
            class="shrink-0 text-slate-400"
          />


          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search members..."
            class="
              min-w-0
              flex-1
              border-0
              bg-transparent
              text-[11px]
              text-slate-700
              outline-none
              placeholder:text-slate-400
            "
          />


          <button
            v-if="searchQuery"
            type="button"
            class="
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              rounded
              text-slate-400
              transition
              hover:bg-slate-200
              hover:text-slate-600
            "
            @click="searchQuery = ''"
          >

            <X :size="13" />

          </button>

        </div>

      </div>


      <!--
      ========================================================================
      LOADING
      ========================================================================
      -->

      <div
        v-if="memberStore.loading"
        class="
          flex
          min-h-65
          items-center
          justify-center
          gap-2
          text-xs
          text-slate-400
        "
      >

        <Loader2
          :size="21"
          class="animate-spin"
        />

        Loading members...

      </div>


      <!--
      ========================================================================
      EMPTY
      ========================================================================
      -->

      <div
        v-else-if="filteredMembers.length === 0"
        class="
          flex
          min-h-65
          flex-col
          items-center
          justify-center
          px-6
          py-10
          text-center
        "
      >

        <div
          class="
            mb-3
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-purple-50
            text-purple-500
          "
        >

          <Users :size="23" />

        </div>


        <h3
          class="
            text-sm
            font-semibold
            text-slate-700
          "
        >

          {{
            searchQuery
              ? "No members found"
              : "No workspace members"
          }}

        </h3>


        <p
          class="
            mt-1
            text-[11px]
            text-slate-400
          "
        >

          {{
            searchQuery
              ? "Try a different search."
              : "There are currently no members in this workspace."
          }}

        </p>

      </div>


      <!--
      ========================================================================
      MEMBERS TABLE
      ========================================================================
      -->

      <div
        v-else
        class="w-full overflow-x-auto"
      >

        <div class="min-w-175">

          <!-- Table header -->

          <div
            class="
              grid
              min-h-10
              grid-cols-[minmax(280px,1.8fr)_1fr_1fr_100px]
              items-center
              gap-5
              bg-slate-50
              px-5
              text-[9px]
              font-semibold
              tracking-wide
              text-slate-400
            "
          >

            <div>
              MEMBER
            </div>

            <div>
              ROLE
            </div>

            <div>
              JOINED
            </div>

            <div class="text-right">
              ACTIONS
            </div>

          </div>


          <!-- Members -->

          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="
              grid
              min-h-17.5
              grid-cols-[minmax(280px,1.8fr)_1fr_1fr_100px]
              items-center
              gap-5
              border-b
              border-slate-100
              px-5
              last:border-b-0
            "
          >

            <!-- Member -->

            <div
              class="
                flex
                min-w-0
                items-center
                gap-3
              "
            >

              <!-- Avatar -->

              <div
                class="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  bg-blue-50
                  text-[11px]
                  font-semibold
                  text-blue-600
                "
              >

                <img
                  v-if="member.user?.avatar"
                  :src="member.user.avatar"
                  :alt="member.user.fullName"
                  class="
                    h-full
                    w-full
                    object-cover
                  "
                />


                <span v-else>
                  {{ getInitials(member) }}
                </span>

              </div>


              <!-- User information -->

              <div class="min-w-0">

                <p
                  class="
                    truncate
                    text-xs
                    font-semibold
                    text-slate-700
                  "
                >
                  {{
                    member.user?.fullName ||
                    "Unknown user"
                  }}
                </p>


                <p
                  class="
                    mt-0.5
                    truncate
                    text-[10px]
                    text-slate-400
                  "
                >
                  {{
                    member.user?.email ||
                    "No email"
                  }}
                </p>

              </div>

            </div>


            <!-- Role -->

            <div>

              <!-- Owner: display only -->

              <span
                v-if="member.role === WorkspaceRole.Owner"
                class="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                "
                :class="roleClasses(member.role)"
              >

                <span
                  class="
                    h-1.5
                    w-1.5
                    rounded-full
                  "
                  :class="roleDotClasses(member.role)"
                />

                {{ formatRole(member.role) }}

              </span>


              <!-- Other roles: open dialog -->

              <button
                v-else
                type="button"
                class="
                  inline-flex
                  cursor-pointer
                  items-center
                  gap-1.5
                  rounded-full
                  border-0
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  outline-none
                  transition
                  hover:opacity-80
                  focus:ring-2
                  focus:ring-blue-100
                "
                :class="roleClasses(member.role)"
                @click="openRoleModal(member)"
              >

                <span
                  class="
                    h-1.5
                    w-1.5
                    rounded-full
                  "
                  :class="roleDotClasses(member.role)"
                />

                {{ formatRole(member.role) }}

              </button>

            </div>


            <!-- Joined -->

            <div
              class="
                text-[11px]
                text-slate-500
              "
            >

              {{ formatDate(member.joinedAt) }}

            </div>


            <!-- Actions -->

            <div
              class="
                flex
                justify-end
              "
            >

              <button
                v-if="canRemove(member)"
                type="button"
                title="Remove member"
                class="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-red-100
                  bg-white
                  text-red-500
                  transition
                  hover:border-red-200
                  hover:bg-red-50
                "
                @click="openDeleteModal(member)"
              >

                <Trash2 :size="14" />

              </button>


              <span
                v-else
                class="
                  text-[9px]
                  text-slate-300
                "
              >
                Workspace owner
              </span>

            </div>

          </div>

        </div>

      </div>


      <!--
      ==========================================================================
      FOOTER
      ==========================================================================
      -->

      <div
        v-if="memberStore.members.length"
        class="
          flex
          min-h-11
          items-center
          border-t
          border-slate-100
          px-5
          text-[10px]
          text-slate-400
        "
      >

        Showing

        <strong
          class="
            mx-1
            font-semibold
            text-slate-600
          "
        >
          {{ filteredMembers.length }}
        </strong>

        of

        <strong
          class="
            mx-1
            font-semibold
            text-slate-600
          "
        >
          {{ memberStore.members.length }}
        </strong>

        members

      </div>

    </section>


    <!--
    ==========================================================================
    CHANGE ROLE MODAL
    ==========================================================================
    -->

    <Transition name="modal">

      <div
        v-if="showRoleModal"
        class="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-slate-900/30
          p-4
          backdrop-blur-[2px]
        "
        @click.self="closeRoleModal"
      >

        <div
          class="
            w-full
            max-w-md
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-2xl
          "
        >

          <!-- Header -->

          <div
            class="
              flex
              items-start
              justify-between
              border-b
              border-slate-100
              px-5
              py-5
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
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-purple-50
                  text-purple-500
                "
              >

                <Shield :size="18" />

              </div>


              <div>

                <h2
                  class="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Change member role
                </h2>


                <p
                  class="
                    mt-0.5
                    text-[10px]
                    text-slate-400
                  "
                >
                  Choose a new role for this member.
                </p>

              </div>

            </div>


            <button
              type="button"
              :disabled="updatingRole"
              class="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-md
                text-slate-400
                transition
                hover:bg-slate-50
                hover:text-slate-600
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              @click="closeRoleModal"
            >

              <X :size="17" />

            </button>

          </div>


          <!-- Content -->

          <div class="px-5 py-5">

            <!-- Selected member -->

            <div class="mb-4">

              <p
                class="
                  text-[11px]
                  font-semibold
                  text-slate-700
                "
              >
                {{
                  selectedRoleMember?.user?.fullName ||
                  "This member"
                }}
              </p>


              <p
                class="
                  mt-0.5
                  text-[10px]
                  text-slate-400
                "
              >
                {{
                  selectedRoleMember?.user?.email ||
                  "No email"
                }}
              </p>

            </div>


            <!-- Roles -->

            <div class="space-y-2">

              <!-- Member -->

              <button
                type="button"
                :disabled="updatingRole"
                class="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  border
                  px-3
                  py-3
                  text-left
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                :class="
                  selectedRole === WorkspaceRole.Member
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                "
                @click="
                  selectedRole = WorkspaceRole.Member
                "
              >

                <div
                  class="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <span
                    class="
                      h-2
                      w-2
                      rounded-full
                      bg-blue-500
                    "
                  />

                  <div>

                    <p
                      class="
                        text-[11px]
                        font-semibold
                        text-slate-700
                      "
                    >
                      Member
                    </p>

                    <p
                      class="
                        mt-0.5
                        text-[9px]
                        text-slate-400
                      "
                    >
                      Standard workspace access
                    </p>

                  </div>

                </div>


                <Check
                  v-if="
                    selectedRole === WorkspaceRole.Member
                  "
                  :size="15"
                  class="text-blue-500"
                />

              </button>


              <!-- Admin -->

              <button
                type="button"
                :disabled="updatingRole"
                class="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  border
                  px-3
                  py-3
                  text-left
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                :class="
                  selectedRole === WorkspaceRole.Admin
                    ? 'border-purple-200 bg-purple-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                "
                @click="
                  selectedRole = WorkspaceRole.Admin
                "
              >

                <div
                  class="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <span
                    class="
                      h-2
                      w-2
                      rounded-full
                      bg-purple-500
                    "
                  />

                  <div>

                    <p
                      class="
                        text-[11px]
                        font-semibold
                        text-slate-700
                      "
                    >
                      Admin
                    </p>

                    <p
                      class="
                        mt-0.5
                        text-[9px]
                        text-slate-400
                      "
                    >
                      Can manage workspace members
                    </p>

                  </div>

                </div>


                <Check
                  v-if="
                    selectedRole === WorkspaceRole.Admin
                  "
                  :size="15"
                  class="text-purple-500"
                />

              </button>


              <!-- Guest -->

              <button
                type="button"
                :disabled="updatingRole"
                class="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  border
                  px-3
                  py-3
                  text-left
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                :class="
                  selectedRole === WorkspaceRole.Guest
                    ? 'border-slate-300 bg-slate-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                "
                @click="
                  selectedRole = WorkspaceRole.Guest
                "
              >

                <div
                  class="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <span
                    class="
                      h-2
                      w-2
                      rounded-full
                      bg-slate-400
                    "
                  />

                  <div>

                    <p
                      class="
                        text-[11px]
                        font-semibold
                        text-slate-700
                      "
                    >
                      Guest
                    </p>

                    <p
                      class="
                        mt-0.5
                        text-[9px]
                        text-slate-400
                      "
                    >
                      Limited workspace access
                    </p>

                  </div>

                </div>


                <Check
                  v-if="
                    selectedRole === WorkspaceRole.Guest
                  "
                  :size="15"
                  class="text-slate-500"
                />

              </button>

            </div>


            <!-- Error -->

            <div
              v-if="roleError"
              class="
                mt-4
                rounded-lg
                bg-red-50
                px-3
                py-2.5
                text-[10px]
                text-red-600
              "
            >

              {{ roleError }}

            </div>

          </div>


          <!-- Actions -->

          <div
            class="
              flex
              justify-between
              gap-2
              border-t
              border-slate-100
              bg-slate-50
              px-5
              py-3.5
            "
          >

            <button
              type="button"
              :disabled="updatingRole"
              class="
                inline-flex
                h-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3.5
                text-[10px]
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              @click="closeRoleModal"
            >
              Cancel
            </button>


<button
  type="button"
  :disabled="
    updatingRole ||
    !selectedRole ||
    selectedRole === selectedRoleMember?.role
  "
  class="
    inline-flex
    h-9
    items-center
    justify-center
    gap-1.5
    rounded-lg
    bg-black
    px-3.5
    text-[10px]
    font-semibold
    text-white
    transition
    hover:bg-slate-800
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
  @click="confirmRoleUpdate"
>
  <Loader2
    v-if="updatingRole"
    :size="14"
    class="animate-spin"
  />

  <Check
    v-else
    :size="14"
  />

  {{
    updatingRole
      ? "Saving..."
      : "Save changes"
  }}
</button>


          </div>

        </div>

      </div>

    </Transition>


    <!--
    ==========================================================================
    REMOVE MEMBER MODAL
    ==========================================================================
    -->

    <Transition name="modal">

      <div
        v-if="showDeleteModal"
        class="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-slate-900/30
          p-4
          backdrop-blur-[2px]
        "
        @click.self="closeDeleteModal"
      >

        <div
          class="
            w-full
            max-w-md
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-2xl
          "
        >

          <!-- Header -->

          <div
            class="
              flex
              items-start
              justify-between
              border-b
              border-slate-100
              px-5
              py-5
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
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-50
                  text-red-500
                "
              >

                <Trash2 :size="18" />

              </div>


              <div>

                <h2
                  class="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Remove member
                </h2>


                <p
                  class="
                    mt-0.5
                    text-[10px]
                    text-slate-400
                  "
                >
                  Remove this person from the workspace?
                </p>

              </div>

            </div>


            <button
              type="button"
              :disabled="deleting"
              class="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-md
                text-slate-400
                transition
                hover:bg-slate-50
                hover:text-slate-600
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              @click="closeDeleteModal"
            >

              <X :size="17" />

            </button>

          </div>


          <!-- Content -->

          <div class="px-5 py-5">

            <p
              class="
                text-[11px]
                leading-6
                text-slate-500
              "
            >

              <strong
                class="
                  font-semibold
                  text-slate-700
                "
              >
                {{
                  selectedMember?.user?.fullName ||
                  "This member"
                }}
              </strong>

              will lose access to this workspace
              and its projects.

            </p>


            <div
              v-if="deleteError"
              class="
                mt-4
                rounded-lg
                bg-red-50
                px-3
                py-2.5
                text-[10px]
                text-red-600
              "
            >

              {{ deleteError }}

            </div>

          </div>


          <!-- Actions -->

          <div
            class="
              flex
              justify-between
              gap-2
              border-t
              border-slate-100
              bg-slate-50
              px-5
              py-3.5
            "
          >

            <button
              type="button"
              :disabled="deleting"
              class="
                inline-flex
                h-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3.5
                text-[10px]
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              @click="closeDeleteModal"
            >
              Cancel
            </button>


            <button
              type="button"
              :disabled="deleting"
              class="
                inline-flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                bg-red-500
                px-3.5
                text-[10px]
                font-semibold
                text-white
                transition
                hover:bg-red-600
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              @click="confirmRemoveMember"
            >

              <Loader2
                v-if="deleting"
                :size="14"
                class="animate-spin"
              />


              <Trash2
                v-else
                :size="14"
              />


              {{
                deleting
                  ? "Removing..."
                  : "Remove member"
              }}

            </button>

          </div>

        </div>

      </div>

    </Transition>

  </div>

</template>


<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(8px) scale(0.98);
}
</style>
