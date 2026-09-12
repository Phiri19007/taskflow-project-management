<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
} from "vue";

import {
  LayoutDashboard,
} from "lucide-vue-next";

import { useAuthStore } from "@/services/stores/auth.store";
import { useWorkspaceStore } from "@/services/stores/workspace.store";
import { useProjectStore } from "@/services/stores/project.store";
import { useTaskStore } from "@/services/stores/task.store";
import { useNotificationStore } from "@/services/stores/notification.store";

import {
  TaskPriority,
  TaskStatus,
  type Task,
} from "@/types/task";

import {
  ProjectStatus,
  type Project,
} from "@/types/project";

import type { Notification } from "@/types/notification";

/*
|--------------------------------------------------------------------------
| Stores
|--------------------------------------------------------------------------
*/

const authStore = useAuthStore();
const workspaceStore = useWorkspaceStore();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const notificationStore = useNotificationStore();

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const loading = ref(true);
const error = ref<string | null>(null);
const allTasks = ref<Task[]>([]);

/*
|--------------------------------------------------------------------------
| Loading configuration
|--------------------------------------------------------------------------
|
| Prevent the loading state from flashing when the API responds very
| quickly. The page will remain in the loading state for at least
| this amount of time.
|
*/

const MIN_LOADING_MS = 700;

/*
|--------------------------------------------------------------------------
| Prevent stale workspace requests
|--------------------------------------------------------------------------
*/

let loadRequestId = 0;

/*
|--------------------------------------------------------------------------
| Workspace
|--------------------------------------------------------------------------
*/

const currentWorkspace = computed(
  () => workspaceStore.currentWorkspace
);

/*
|--------------------------------------------------------------------------
| Current user
|--------------------------------------------------------------------------
*/

const currentUser = computed(
  () => authStore.user
);

/*
|--------------------------------------------------------------------------
| Workspace project state
|--------------------------------------------------------------------------
*/

const workspaceProjects = computed<Project[]>(() => {
  return projectStore.projects;
});

const hasWorkspaceProjects = computed(() => {
  return workspaceProjects.value.length > 0;
});

/*
|--------------------------------------------------------------------------
| Date helpers
|--------------------------------------------------------------------------
*/

function startOfToday(): Date {
  const date = new Date();

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
}

function endOfToday(): Date {
  const date = new Date();

  date.setHours(
    23,
    59,
    59,
    999
  );

  return date;
}

function addDays(
  date: Date,
  days: number
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "No deadline";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function formatActivityDate(
  value: string
): string {
  const created =
    new Date(value).getTime();

  if (
    Number.isNaN(created)
  ) {
    return "";
  }

  const difference =
    Date.now() - created;

  const minutes =
    Math.floor(
      difference / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(value);
}

/*
|--------------------------------------------------------------------------
| Task assignment
|--------------------------------------------------------------------------
*/

function isAssignedToCurrentUser(
  task: Task
): boolean {
  const userId =
    currentUser.value?.id;

  if (!userId) {
    return false;
  }

  const taskWithAssignment =
    task as Task & {
      assignee?: {
        id?: string | number;
      } | null;

      assignedTo?: {
        id?: string | number;
      } | null;

      user?: {
        id?: string | number;
      } | null;
    };

  return (
    String(
      taskWithAssignment.assignee?.id ??
      ""
    ) === String(userId) ||

    String(
      taskWithAssignment.assignedTo?.id ??
      ""
    ) === String(userId) ||

    String(
      taskWithAssignment.user?.id ??
      ""
    ) === String(userId)
  );
}

/*
|--------------------------------------------------------------------------
| Task helpers
|--------------------------------------------------------------------------
*/

function isCompleted(
  task: Task
): boolean {
  return (
    task.status ===
    TaskStatus.Done
  );
}

function isOverdue(
  task: Task
): boolean {
  if (
    !task.dueDate ||
    isCompleted(task)
  ) {
    return false;
  }

  return (
    new Date(task.dueDate) <
    startOfToday()
  );
}

function isDueToday(
  task: Task
): boolean {
  if (
    !task.dueDate ||
    isCompleted(task)
  ) {
    return false;
  }

  const date =
    new Date(task.dueDate);

  return (
    date >= startOfToday() &&
    date <= endOfToday()
  );
}

/*
|--------------------------------------------------------------------------
| Upcoming deadlines
|--------------------------------------------------------------------------
*/

function isUpcomingDeadline(
  task: Task
): boolean {
  if (
    !task.dueDate ||
    isCompleted(task)
  ) {
    return false;
  }

  const dueDate =
    new Date(task.dueDate);

  if (
    Number.isNaN(
      dueDate.getTime()
    )
  ) {
    return false;
  }

  const start =
    startOfToday();

  const threeDays =
    addDays(
      start,
      3
    );

  const sevenDays =
    addDays(
      start,
      7
    );

  sevenDays.setHours(
    23,
    59,
    59,
    999
  );

  return (
    dueDate >= threeDays &&
    dueDate <= sevenDays
  );
}

/*
|--------------------------------------------------------------------------
| Days until deadline
|--------------------------------------------------------------------------
*/

function getDaysUntilDeadline(
  task: Task
): string {
  if (!task.dueDate) {
    return "No deadline";
  }

  const dueDate =
    new Date(task.dueDate);

  const today =
    startOfToday();

  const deadline =
    new Date(dueDate);

  deadline.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    deadline.getTime() -
    today.getTime();

  const days =
    Math.round(
      difference /
      (1000 * 60 * 60 * 24)
    );

  if (days === 0) {
    return "Today";
  }

  if (days === 1) {
    return "Tomorrow";
  }

  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }

  return `In ${days} days`;
}

/*
|--------------------------------------------------------------------------
| User tasks
|--------------------------------------------------------------------------
*/

const myTasks = computed(() => {
  return allTasks.value.filter(
    task =>
      isAssignedToCurrentUser(
        task
      )
  );
});

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

const pendingTasks = computed(() =>
  myTasks.value.filter(
    task =>
      !isCompleted(task)
  )
);

const completedTasks = computed(() =>
  myTasks.value.filter(
    task =>
      isCompleted(task)
  )
);

const overdueTasks = computed(() =>
  myTasks.value.filter(
    task =>
      isOverdue(task)
  )
);

const dueTodayTasks = computed(() =>
  myTasks.value.filter(
    task =>
      isDueToday(task)
  )
);

const activeProjects = computed(() =>
  workspaceProjects.value.filter(
    project =>
      project.status ===
      ProjectStatus.ACTIVE
  )
);

const completionRate = computed(() => {
  if (!myTasks.value.length) {
    return 0;
  }

  return Math.round(
    (completedTasks.value.length /
      myTasks.value.length) *
    100
  );
});

/*
|--------------------------------------------------------------------------
| Dashboard tasks
|--------------------------------------------------------------------------
*/

const dashboardTasks = computed(() => {
  return [
    ...pendingTasks.value,
  ]
    .sort((a, b) => {
      const aOverdue =
        isOverdue(a);

      const bOverdue =
        isOverdue(b);

      if (
        aOverdue &&
        !bOverdue
      ) {
        return -1;
      }

      if (
        !aOverdue &&
        bOverdue
      ) {
        return 1;
      }

      if (
        a.dueDate &&
        b.dueDate
      ) {
        return (
          new Date(
            a.dueDate
          ).getTime() -
          new Date(
            b.dueDate
          ).getTime()
        );
      }

      if (a.dueDate) {
        return -1;
      }

      if (b.dueDate) {
        return 1;
      }

      return 0;
    })
    .slice(0, 6);
});

/*
|--------------------------------------------------------------------------
| Upcoming deadlines
|--------------------------------------------------------------------------
*/

const upcomingDeadlines =
  computed(() => {
    return myTasks.value
      .filter(
        task =>
          isUpcomingDeadline(
            task
          )
      )
      .sort(
        (a, b) =>
          new Date(
            a.dueDate!
          ).getTime() -
          new Date(
            b.dueDate!
          ).getTime()
      )
      .slice(0, 5);
  });

/*
|--------------------------------------------------------------------------
| Recent activity
|--------------------------------------------------------------------------
*/

const recentActivity =
  computed(() => {
    const workspaceId =
      currentWorkspace.value?.id;

    return [
      ...notificationStore.notifications,
    ]
      .filter(
        notification => {
          if (!workspaceId) {
            return true;
          }

          return (
            notification.workspace?.id ===
            workspaceId
          );
        }
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      )
      .slice(0, 5);
  });

/*
|--------------------------------------------------------------------------
| Project helpers
|--------------------------------------------------------------------------
*/

function getProjectTasks(
  project: Project
): Task[] {
  return myTasks.value.filter(
    task =>
      String(
        task.project?.id ?? ""
      ) ===
      String(project.id)
  );
}

function getProjectProgress(
  project: Project
): number {
  const tasks =
    getProjectTasks(
      project
    );

  if (!tasks.length) {
    return 0;
  }

  const completed =
    tasks.filter(
      task =>
        isCompleted(task)
    ).length;

  return Math.round(
    (completed /
      tasks.length) *
    100
  );
}

function getProjectTaskCount(
  project: Project
): number {
  return getProjectTasks(
    project
  ).length;
}

/*
|--------------------------------------------------------------------------
| Workload
|--------------------------------------------------------------------------
*/

function getProjectWorkload(
  project: Project
): number {
  const tasks =
    getProjectTasks(
      project
    );

  if (!tasks.length) {
    return 0;
  }

  const active =
    tasks.filter(
      task =>
        !isCompleted(task)
    ).length;

  return Math.min(
    100,
    Math.round(
      (active / 8) * 100
    )
  );
}

function getWorkloadStatus(
  percentage: number
): string {
  if (percentage >= 75) {
    return "Busy";
  }

  if (percentage >= 35) {
    return "Balanced";
  }

  return "Free";
}

function getWorkloadClass(
  percentage: number
): string {
  if (percentage >= 75) {
    return "bg-rose-500";
  }

  if (percentage >= 35) {
    return "bg-emerald-500";
  }

  return "bg-blue-500";
}

function getWorkloadTextClass(
  percentage: number
): string {
  if (percentage >= 75) {
    return "text-rose-600";
  }

  if (percentage >= 35) {
    return "text-emerald-600";
  }

  return "text-blue-600";
}

/*
|--------------------------------------------------------------------------
| Status styling
|--------------------------------------------------------------------------
*/

function getTaskStatusClass(
  status: TaskStatus
): string {
  switch (status) {
    case TaskStatus.InProgress:
      return "bg-blue-50 text-blue-700";

    case TaskStatus.Review:
      return "bg-violet-50 text-violet-700";

    case TaskStatus.Done:
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getTaskStatusLabel(
  status: TaskStatus
): string {
  switch (status) {
    case TaskStatus.InProgress:
      return "In progress";

    case TaskStatus.Review:
      return "Review";

    case TaskStatus.Done:
      return "Done";

    default:
      return "To do";
  }
}

/*
|--------------------------------------------------------------------------
| Priority styling
|--------------------------------------------------------------------------
*/

function getPriorityClass(
  priority: TaskPriority
): string {
  switch (priority) {
    case TaskPriority.Critical:
      return "bg-rose-50 text-rose-700";

    case TaskPriority.High:
      return "bg-orange-50 text-orange-700";

    case TaskPriority.Medium:
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-500";
  }
}

/*
|--------------------------------------------------------------------------
| Project status
|--------------------------------------------------------------------------
*/

function getProjectStatusClass(
  status: ProjectStatus
): string {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return "bg-blue-50 text-blue-700";

    case ProjectStatus.COMPLETED:
      return "bg-emerald-50 text-emerald-700";

    case ProjectStatus.PLANNING:
      return "bg-slate-100 text-slate-600";

    case ProjectStatus.ON_HOLD:
      return "bg-amber-50 text-amber-700";

    case ProjectStatus.ARCHIVED:
      return "bg-slate-100 text-slate-500";

    default:
      return "bg-slate-100 text-slate-500";
  }
}

function getProjectStatusLabel(
  status: ProjectStatus
): string {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return "Active";

    case ProjectStatus.COMPLETED:
      return "Completed";

    case ProjectStatus.PLANNING:
      return "Planning";

    case ProjectStatus.ON_HOLD:
      return "On hold";

    case ProjectStatus.ARCHIVED:
      return "Archived";

    default:
      return status;
  }
}

/*
|--------------------------------------------------------------------------
| Activity
|--------------------------------------------------------------------------
*/

function getActivityIcon(
  type: string
): string {
  const value =
    type.toLowerCase();

  if (
    value.includes("created")
  ) {
    return "+";
  }

  if (
    value.includes("completed") ||
    value.includes("done")
  ) {
    return "✓";
  }

  if (
    value.includes("comment")
  ) {
    return "C";
  }

  if (
    value.includes("deleted") ||
    value.includes("removed")
  ) {
    return "×";
  }

  if (
    value.includes("updated") ||
    value.includes("changed")
  ) {
    return "↻";
  }

  return "•";
}

function getActivityClass(
  type: string
): string {
  const value =
    type.toLowerCase();

  if (
    value.includes("completed") ||
    value.includes("done")
  ) {
    return "bg-emerald-50 text-emerald-600";
  }

  if (
    value.includes("created")
  ) {
    return "bg-blue-50 text-blue-600";
  }

  if (
    value.includes("comment")
  ) {
    return "bg-violet-50 text-violet-600";
  }

  if (
    value.includes("deleted") ||
    value.includes("removed")
  ) {
    return "bg-rose-50 text-rose-600";
  }

  return "bg-slate-100 text-slate-500";
}

/*
|--------------------------------------------------------------------------
| Actor
|--------------------------------------------------------------------------
*/

function getActorName(
  notification: Notification
): string {
  if (!notification.actor) {
    return "TaskFlow";
  }

  return (
    notification.actor.fullName ||
    "Someone"
  );
}

/*
|--------------------------------------------------------------------------
| Minimum loading duration
|--------------------------------------------------------------------------
*/

function waitForMinimumLoadingTime(
  startedAt: number
): Promise<void> {
  const elapsed =
    Date.now() - startedAt;

  const remaining =
    Math.max(
      0,
      MIN_LOADING_MS - elapsed
    );

  if (!remaining) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    setTimeout(
      resolve,
      remaining
    );
  });
}

/*
|--------------------------------------------------------------------------
| Load dashboard
|--------------------------------------------------------------------------
*/

async function loadDashboard() {
  const requestId =
    ++loadRequestId;

  const startedAt =
    Date.now();

  loading.value = true;
  error.value = null;

  try {
    /*
     * Load authenticated user first.
     */

    if (!authStore.user) {
      await authStore.fetchCurrentUser();
    }

    /*
     * Use the currently selected workspace.
     */

    const workspace =
      workspaceStore.currentWorkspace;

    /*
     * No workspace selected.
     */

    if (!workspace) {
      allTasks.value = [];

      projectStore.clear();

      return;
    }

    const workspaceId =
      workspace.id;

    /*
     * Clear previous workspace data.
     */

    allTasks.value = [];
    projectStore.clear();

    /*
     * Load projects and notifications first.
     *
     * This is important because we determine whether
     * the workspace has projects before loading tasks.
     */

    await Promise.all([
      projectStore.fetchProjects(
        workspaceId
      ),

      notificationStore.fetchNotifications(),
    ]);

    /*
     * Ignore stale request.
     */

    if (
      requestId !== loadRequestId ||
      workspaceStore.currentWorkspace?.id !==
      workspaceId
    ) {
      return;
    }

    /*
     * Workspace has no projects.
     *
     * Stop here.
     *
     * We DO NOT fetch tasks.
     */

    if (
      !projectStore.projects.length
    ) {
      allTasks.value = [];

      return;
    }

    /*
     * Projects exist.
     *
     * Now load tasks for every project.
     */

    const taskResults =
      await Promise.all(
        projectStore.projects.map(
          project =>
            taskStore.fetchProjectReportTasks(
              project.id
            )
        )
      );

    /*
     * Ignore stale request.
     */

    if (
      requestId !== loadRequestId ||
      workspaceStore.currentWorkspace?.id !==
      workspaceId
    ) {
      return;
    }

    /*
     * Flatten all project tasks.
     */

    allTasks.value =
      taskResults.flat();

  } catch (err: any) {
    if (
      requestId !== loadRequestId
    ) {
      return;
    }

    console.error(
      "Dashboard error:",
      err
    );

    error.value =
      err?.response?.data?.message ||
      err?.message ||
      "Unable to load dashboard.";

  } finally {
    /*
     * Do not allow a very fast request to cause
     * loading -> content flashing.
     */

    await waitForMinimumLoadingTime(
      startedAt
    );

    /*
     * Only the newest request can control loading.
     */

    if (
      requestId === loadRequestId
    ) {
      loading.value = false;
    }
  }
}

/*
|--------------------------------------------------------------------------
| Initial load
|--------------------------------------------------------------------------
*/

onMounted(() => {
  loadDashboard();
});

/*
|--------------------------------------------------------------------------
| Workspace change
|--------------------------------------------------------------------------
*/

watch(
  () =>
    workspaceStore.currentWorkspace?.id,

  (
    newWorkspaceId,
    oldWorkspaceId
  ) => {
    if (
      newWorkspaceId ===
      oldWorkspaceId
    ) {
      return;
    }

    loadDashboard();
  }
);
</script>

<template>
  <main id="dashboard-view" class="min-h-full flex-1 overflow-y-auto ">
    <div class="mx-auto w-full max-w-375 px-4 py-4 sm:px-5 lg:px-6">

      <div class="mb-4 flex items-center justify-between border-b border-slate-200/60 pb-5 shrink-0">
        <div>
          <h1 class="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
            <LayoutDashboard class="h-5 w-5 text-slate-600" />

            Dashboard
          </h1>

          <p class="mt-0.5 text-[12px] font-medium text-slate-400">
            Overview of your workspace, projects, tasks, and activity.
          </p>
        </div>
      </div>


      <!-- ================================================= -->
      <!-- LOADING -->
      <!-- ================================================= -->

      <div v-if="loading" class="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div class="flex flex-col items-center justify-center text-center">

          <!-- Spinner -->

          <div class="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <!-- Text -->

          <p class="mt-4 text-sm font-semibold text-slate-700">
            Loading dashboard
          </p>

          <p class="mt-1 text-xs text-slate-400">
            Checking your workspace and projects...
          </p>

        </div>
      </div>


      <!-- ================================================= -->
      <!-- ERROR -->
      <!-- ================================================= -->

      <div v-else-if="error" class="flex min-h-125 items-center justify-center">
        <div class="w-full max-w-md rounded-xl border border-rose-100 bg-white p-7 text-center shadow-sm">
          <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 font-bold text-rose-500">
            !
          </div>

          <h2 class="mt-4 text-base font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p class="mt-2 text-xs leading-5 text-slate-500">
            {{ error }}
          </p>

          <button type="button"
            class="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            @click="loadDashboard()">
            Try again
          </button>
        </div>
      </div>


      <!-- ================================================= -->
      <!-- NO WORKSPACE -->
      <!-- ================================================= -->

      <div v-else-if="!currentWorkspace" class="flex min-h-[60vh] items-center justify-center">
        <div class="w-full max-w-xl px-6 py-12 text-center">

          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
              <path
                d="M4 6.5A2.5 2.5 0 0 1 6.5 4H11l2 3h4.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />

              <path d="M8 12h8M8 15h5" stroke-linecap="round" />
            </svg>
          </div>

          <h1 class="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Create workspace to get started
          </h1>

          <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Create a new workspace and we'll bring your projects,
            tasks, deadlines, and activity together for you.
          </p>
        </div>
      </div>


      <!-- ================================================= -->
      <!-- WORKSPACE WITHOUT PROJECTS -->
      <!-- ================================================= -->

      <div v-else-if="!hasWorkspaceProjects" class="flex items-center justify-center  min-h-[60vh]">
        <section class="w-full max-w-xl px-6 py-12 text-center">

          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-black-600">
            <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
              <path
                d="M4 6.5A2.5 2.5 0 0 1 6.5 4H11l2 3h4.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />

              <path d="M8 12h8M8 15h5" stroke-linecap="round" />
            </svg>
          </div>

          <p class="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-black-500">
            {{ currentWorkspace.name }}
          </p>

          <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Nothing to manage yet.
          </h1>

          <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Your workspace is ready when you are. Once you
            create your first project, your tasks, progress,
            deadlines, and activity will all come together here.
          </p>

        </section>
      </div>


      <!-- ================================================= -->
      <!-- FULL DASHBOARD -->
      <!-- ================================================= -->

      <div v-else class="space-y-4">

        <!-- ================================================= -->
        <!-- OVERVIEW -->
        <!-- ================================================= -->

        <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="grid grid-cols-2 divide-x divide-y divide-slate-100 lg:grid-cols-4 lg:divide-y-0">

            <!-- Active Projects -->

            <div class="p-4 transition hover:bg-slate-50/50">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Active projects
                  </p>

                  <p class="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
                    {{ activeProjects.length }}
                  </p>

                  <p class="mt-0.5 text-[9px] text-slate-400">
                    In progress
                  </p>
                </div>

                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 5a2 2 0 0 1 2-2h5l2 3h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
                  </svg>
                </div>
              </div>
            </div>


            <!-- Pending Tasks -->

            <div class="p-4 transition hover:bg-slate-50/50">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Pending tasks
                  </p>

                  <p class="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
                    {{ pendingTasks.length }}
                  </p>

                  <p class="mt-0.5 text-[9px] text-slate-400">
                    {{ dueTodayTasks.length }} due today
                  </p>
                </div>

                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="17" rx="2" />

                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
              </div>
            </div>


            <!-- Overdue -->

            <div class="p-4 transition" :class="overdueTasks.length
                ? 'bg-rose-50/40 hover:bg-rose-50/60'
                : 'hover:bg-slate-50/50'
              ">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-[10px] font-semibold uppercase tracking-wide" :class="overdueTasks.length
                      ? 'text-rose-500'
                      : 'text-slate-400'
                    ">
                    Overdue
                  </p>

                  <p class="mt-1.5 text-xl font-bold tracking-tight" :class="overdueTasks.length
                      ? 'text-rose-600'
                      : 'text-slate-900'
                    ">
                    {{ overdueTasks.length }}
                  </p>

                  <p class="mt-0.5 text-[9px] text-slate-400">
                    {{
                      overdueTasks.length
                        ? "Needs attention"
                        : "All caught up"
                    }}
                  </p>
                </div>

                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" :class="overdueTasks.length
                    ? 'bg-rose-500 text-white'
                    : 'bg-emerald-50 text-emerald-600'
                  ">
                  <svg v-if="overdueTasks.length" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <circle cx="12" cy="12" r="9" />

                    <path d="M12 7v5l3 2" />
                  </svg>

                  <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>
              </div>
            </div>


            <!-- Completion -->

            <div class="p-4 transition hover:bg-slate-50/50">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Completion
                  </p>

                  <p class="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
                    {{ completionRate }}%
                  </p>

                  <p class="mt-0.5 text-[9px] text-slate-400">
                    {{ completedTasks.length }} completed
                  </p>
                </div>

                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9" />

                    <path d="m8 12 2.5 2.5L16 9" />
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </section>


        <!-- ================================================= -->
        <!-- MY WORK -->
        <!-- ================================================= -->

        <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div>
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-blue-500" />

                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800">
                  My Work
                </h2>
              </div>

              <p class="mt-1 text-[10px] text-slate-400">
                Your current tasks and upcoming deadlines
              </p>
            </div>

            <span
              class="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              {{ pendingTasks.length }} pending
            </span>
          </div>


          <div class="grid grid-cols-1 xl:grid-cols-3">

            <!-- MY TASKS -->

            <div class="xl:col-span-2 xl:border-r xl:border-slate-100">

              <div class="border-b border-slate-100 px-4 py-3 sm:px-5">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wide text-slate-700">
                      Tasks
                    </p>

                    <p class="mt-0.5 text-[9px] text-slate-400">
                      Your pending work
                    </p>
                  </div>

                  <span v-if="overdueTasks.length"
                    class="rounded-full bg-rose-50 px-2 py-1 text-[8px] font-bold text-rose-600">
                    {{ overdueTasks.length }} overdue
                  </span>
                </div>
              </div>


              <!-- Empty Tasks -->

              <div v-if="dashboardTasks.length === 0" class="px-5 py-14 text-center">
                <div
                  class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>

                <p class="mt-3 text-xs font-bold text-slate-800">
                  You're all caught up
                </p>

                <p class="mt-1 text-[10px] text-slate-400">
                  No pending tasks assigned to you.
                </p>
              </div>


              <!-- Task List -->

              <div v-else class="divide-y divide-slate-100">
                <div v-for="task in dashboardTasks" :key="task.id"
                  class="group flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-blue-50/40 sm:px-5"
                  role="button" tabindex="0" @click="
                    task.project?.id &&
                    $router.push({
                      name: 'project-tasks',
                      params: {
                        projectId: task.project.id,
                      },
                    })
                    " @keydown.enter="
                    task.project?.id &&
                    $router.push({
                      name: 'project-tasks',
                      params: {
                        projectId: task.project.id,
                      },
                    })
                    ">

                  <span class="h-2 w-2 shrink-0 rounded-full" :class="task.priority === TaskPriority.Critical
                      ? 'bg-rose-500'
                      : task.priority === TaskPriority.High
                        ? 'bg-orange-500'
                        : task.priority === TaskPriority.Medium
                          ? 'bg-amber-400'
                          : 'bg-slate-300'
                    " />

                  <div class="min-w-0 flex-1">
                    <div class="flex min-w-0 items-center gap-2">
                      <p class="truncate text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                        {{ task.title }}
                      </p>

                      <span v-if="task.project?.name"
                        class="hidden shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-500 md:block">
                        {{ task.project.name }}
                      </span>
                    </div>

                    <p class="mt-0.5 truncate text-[9px] text-slate-400">
                      {{
                        task.project?.name ||
                        "No project"
                      }}
                    </p>
                  </div>

                  <span class="hidden shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold sm:block" :class="getTaskStatusClass(
                    task.status
                  )
                    ">
                    {{
                      getTaskStatusLabel(
                        task.status
                      )
                    }}
                  </span>

                  <span class="hidden shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold md:block" :class="getPriorityClass(
                    task.priority
                  )
                    ">
                    {{ task.priority }}
                  </span>

                  <div class="w-16.25 shrink-0 text-right">
                    <p class="text-[9px] font-bold" :class="isOverdue(task)
                        ? 'text-rose-600'
                        : isDueToday(task)
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      ">
                      {{
                        isOverdue(task)
                          ? "Overdue"
                          : isDueToday(task)
                            ? "Today"
                            : formatDate(
                              task.dueDate
                            )
                      }}
                    </p>

                    <p v-if="
                      task.dueDate &&
                      !isOverdue(task)
                    " class="mt-0.5 text-[8px] text-slate-400">
                      {{
                        getDaysUntilDeadline(
                          task
                        )
                      }}
                    </p>
                  </div>

                </div>
              </div>

            </div>


            <!-- UPCOMING -->

            <div>

              <div class="border-b border-slate-100 px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />

                  <p class="text-[10px] font-bold uppercase tracking-wide text-slate-700">
                    Upcoming
                  </p>
                </div>

                <p class="mt-0.5 text-[9px] text-slate-400">
                  Deadlines in 3–7 days
                </p>
              </div>


              <div v-if="upcomingDeadlines.length" class="divide-y divide-slate-100">
                <div v-for="task in upcomingDeadlines" :key="task.id"
                  class="group flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-amber-50/40"
                  role="button" tabindex="0" @click="
                    task.project?.id &&
                    $router.push({
                      name: 'project-tasks',
                      params: {
                        projectId: task.project.id,
                      },
                    })
                    " @keydown.enter="
                    task.project?.id &&
                    $router.push({
                      name: 'project-tasks',
                      params: {
                        projectId: task.project.id,
                      },
                    })
                    ">

                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="17" rx="2" />

                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[10px] font-semibold text-slate-700 group-hover:text-amber-700">
                      {{ task.title }}
                    </p>

                    <p class="mt-0.5 truncate text-[9px] text-slate-400">
                      {{
                        task.project?.name ||
                        "No project"
                      }}
                    </p>
                  </div>

                  <span class="shrink-0 rounded-md bg-amber-50 px-1.5 py-1 text-[8px] font-bold text-amber-700">
                    {{
                      getDaysUntilDeadline(
                        task
                      )
                    }}
                  </span>

                </div>
              </div>


              <div v-else class="px-5 py-14 text-center">
                <div class="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  —
                </div>

                <p class="mt-3 text-xs font-semibold text-slate-700">
                  No upcoming deadlines
                </p>

                <p class="mt-1 text-[9px] text-slate-400">
                  Nothing is due soon.
                </p>
              </div>

            </div>

          </div>
        </section>


        <!-- ================================================= -->
        <!-- PROJECTS + ACTIVITY -->
        <!-- ================================================= -->

        <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">

          <!-- PROJECTS -->

          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

            <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div>
                <div class="flex items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full bg-blue-500" />

                  <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Projects
                  </h2>
                </div>

                <p class="mt-1 text-[10px] text-slate-400">
                  Your active projects
                </p>
              </div>

              <span class="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                {{ Math.min(activeProjects.length, 5) }} shown
              </span>
            </div>


            <div v-if="activeProjects.length" class="divide-y divide-slate-100">
              <div v-for="project in activeProjects.slice(0, 5)" :key="project.id"
                class="group flex cursor-pointer items-center gap-3 px-4 py-3.5 transition hover:bg-violet-50/40 sm:px-5"
                role="button" tabindex="0" @click="
                  $router.push({
                    name: 'project-home',
                    params: {
                      projectId: project.id,
                    },
                  })
                  " @keydown.enter="
                  $router.push({
                    name: 'project-home',
                    params: {
                      projectId: project.id,
                    },
                  })
                  ">

                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-blue-600">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 5a2 2 0 0 1 2-2h5l2 3h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
                  </svg>
                </div>


                <div class="min-w-0 flex-1">
                  <div class="flex min-w-0 items-center gap-2">
                    <p class="truncate text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                      {{ project.name }}
                    </p>

                    <span class="hidden shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold sm:block" :class="getProjectStatusClass(
                      project.status
                    )
                      ">
                      {{
                        getProjectStatusLabel(
                          project.status
                        )
                      }}
                    </span>
                  </div>

                  <p class="mt-0.5 truncate text-[9px] text-slate-400">
                    {{
                      getProjectTaskCount(
                        project
                      )
                    }}
                    {{
                      getProjectTaskCount(
                        project
                      ) === 1
                        ? "task"
                        : "tasks"
                    }}
                  </p>
                </div>


                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 transition group-hover:bg-violet-50 group-hover:text-blue-600">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>

              </div>
            </div>


            <div v-else class="px-5 py-12 text-center">
              <div class="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                —
              </div>

              <p class="mt-3 text-xs font-semibold text-slate-700">
                No active projects
              </p>

              <p class="mt-1 text-[9px] text-slate-400">
                Your projects will appear here when a project
                becomes active.
              </p>
            </div>

          </div>


          <!-- RECENT ACTIVITY -->

          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-100 px-4 py-4">
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Recent activity
                </h2>
              </div>

              <p class="mt-1 text-[10px] text-slate-400">
                Latest workspace updates
              </p>
            </div>


            <div v-if="recentActivity.length" class="divide-y divide-slate-100">
              <div v-for="notification in recentActivity" :key="notification.id" class="flex gap-2.5 px-4 py-3">

                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold" :class="getActivityClass(
                  notification.type
                )
                  ">
                  {{
                    getActivityIcon(
                      notification.type
                    )
                  }}
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-[10px] font-medium text-slate-600">
                    <span class="font-semibold text-slate-800">
                      {{
                        getActorName(
                          notification
                        )
                      }}
                    </span>
                  </p>

                  <p class="mt-0.5 truncate text-[9px] text-slate-400">
                    {{ notification.type }}
                  </p>

                  <p class="mt-0.5 text-[8px] text-slate-400">
                    {{
                      formatActivityDate(
                        notification.createdAt
                      )
                    }}
                  </p>
                </div>

              </div>
            </div>


            <div v-else class="px-5 py-12 text-center">
              <div class="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                —
              </div>

              <p class="mt-3 text-xs font-semibold text-slate-700">
                No recent activity
              </p>

              <p class="mt-1 text-[9px] text-slate-400">
                Workspace activity will appear here.
              </p>
            </div>

          </div>

        </section>


      </div>

    </div>
  </main>
</template>
