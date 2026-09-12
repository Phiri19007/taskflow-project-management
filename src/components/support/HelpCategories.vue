```vue
<script setup lang="ts">
import { ref } from "vue";

import {
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Bell,
} from "lucide-vue-next";

import HelpTopicDialog from "@/components/support/HelpTopicDialog.vue";

type HelpArticle = {
  title: string;
  description: string;
  steps: string[];
};

export type HelpCategory = {
  title: string;
  description: string;
  icon: any;
  iconClass: string;
  overview: string;
  articles: HelpArticle[];
};

const categories: HelpCategory[] = [
  // ─────────────────────────────────────────────
  // PROJECTS
  // ─────────────────────────────────────────────

  {
    title: "Projects",
    description: "Create, organize, and manage your projects.",
    icon: FolderKanban,
    iconClass: "bg-blue-50 text-blue-600",

    overview:
      "Learn how to create and manage projects, configure project details, organize your work, and keep track of project progress.",

    articles: [
      {
        title: "Creating a new project",
        description:
          "Create a new project and configure its basic information.",

        steps: [
          "Open Projects from the dashboard sidebar. Active Projects is shown by default.",
          "Click the New Project button.",
          "Enter a name for your project.",
          "Add an optional description explaining the project's goals.",
          "Choose a start date and end date if your project has a defined timeline.",
          "Review the project information.",
          "Click Create Project to create the project.",
          "Your new project will now appear in the Projects list.",
        ],
      },

      {
        title: "Managing project details",
        description:
          "Update the name, description, dates, and other information for an existing project.",

        steps: [
          "Open the Projects section.",
          "Find the project you want to manage.",
          "Click the project to open its details.",
          "Click Update to modify the project. The Update option is available only to the project owner.",
          "Update the project name or description as needed.",
          "Update the project start or end date if necessary.",
          "Review your changes.",
          "Save the updated project information.",
        ],
      },

      {
        title: "Setting project dates",
        description:
          "Set or update a project timeline so your team knows when the project starts and is expected to end.",

        steps: [
          "Open the Projects section.",
          "Find the project you want to manage.",
          "Click the project to open its details.",
          "Click Update to modify the project. The Update option is available only to the project owner.",
          "Update the project start date if necessary.",
          "Update the project end date if necessary.",
          "Review your changes.",
          "Save the updated project information.",
        ],
      },

      {
        title: "Archiving a project",
        description:
          "Change a project's status to Archived when it is no longer active but you want to keep its information.",

        steps: [
          "Open the Projects section.",
          "Find the project you want to archive.",
          "Click the project to open its details.",
          "Click Update to modify the project. Only the project owner can access this option.",
          "Open the Project Status selector.",
          "Select Archived from the available statuses.",
          "Review the updated project status.",
          "Save the updated project information.",
          "The project will no longer appear among your active projects.",
        ],
      },

      {
        title: "Managing project status",
        description:
          "Keep your project status up to date so everyone understands its current state.",

        steps: [
          "Open the Projects section.",
          "Find the project you want to update.",
          "Click the project to open its details.",
          "Click Update to modify the project. Only the project owner can access this option.",
          "Open the Project Status selector.",
          "Select the appropriate status.",
          "Review the updated project status.",
          "Save the updated project information.",
        ],
      },
    ],
  },


  // ─────────────────────────────────────────────
  // TASKS
  // ─────────────────────────────────────────────

  {
    title: "Tasks",
    description: "Create, assign, and track tasks across projects.",
    icon: CheckSquare,
    iconClass: "bg-green-50 text-green-600",

    overview:
      "Learn how to create tasks, assign work to project team members, set priorities and due dates, and track tasks as work progresses.",

    articles: [
      {
        title: "Creating a task",
        description:
          "Create a task within a project and assign it to a project team member.",

        steps: [
          "Open the Projects section.",
          "Find and select the project where you want to create the task.",
          "Open the project details page.",
          "Select the Board, Tasks, or Calendar tab.",
          "Click Add Task to create a new task. This option is available only to the project owner or members of the project team.",
          "Enter a clear title describing the task.",
          "Add a description with any additional requirements or instructions.",
          "Select the appropriate task status.",
          "Select a priority for the task.",
          "Set a due date for the task if required.",
          "Assign the task to a project team member.",
          "Review the task information.",
          "Click Create Task to save the task.",
        ],
      },

      {
        title: "Assigning tasks",
        description:
          "Assign a task to a workspace member who is responsible for completing the work.",

        steps: [
          "Open the Projects section.",
          "Find and select the project where you want to create the task.",
          "Open the project details page.",
          "Select the Board, Tasks, or Calendar tab.",
          "Click Add Task to create a new task.",
          "Complete the required task information.",
          "Locate the Assign field.",
          "Open the member selector to view available workspace members.",
          "Select the workspace member who should complete the task.",
          "Review the selected assignee.",
          "Click Create Task to save the task with the assigned member.",
        ],
      },

      {
        title: "Changing task status",
        description:
          "Update a task's status as work progresses so the project team can understand its current state.",

        steps: [
          "Open the Projects section.",
          "Find and select the project containing the task.",
          "Open the project details page.",
          "Select the Tasks or Calendar tab.",
          "Find and click the task you want to update.",
          "Review the task information in the task details dialog.",
          "Click Manage to open the task management dialog. This option is available to the project owner or the member handling the task.",
          "Locate the Status field.",
          "Select the appropriate task status.",
          "Review your changes.",
          "Save the updated task information.",
        ],
      },

      {
        title: "Setting task priorities",
        description:
          "Set a task priority to communicate how urgently the work should be completed.",

        steps: [
          "Open the Projects section.",
          "Find and select the project containing the task.",
          "Open the project details page.",
          "Select the Tasks or Calendar tab.",
          "Find and click the task you want to update.",
          "Review the task information in the task details dialog.",
          "Click Manage to open the task management dialog. This option is available to the project owner or the member handling the task.",
          "Locate the Priority field.",
          "Select the appropriate priority level.",
          "Review your changes.",
          "Save the updated task information.",
        ],
      },

      {
        title: "Managing due dates",
        description:
          "Set and update task due dates so your team knows when work is expected to be completed.",

        steps: [
          "Open the Projects section.",
          "Find and select the project containing the task.",
          "Open the project details page.",
          "Select the Tasks or Calendar tab.",
          "Find and click the task you want to update.",
          "Review the task information in the task details dialog.",
          "Click Manage to open the task management dialog. This option is available to the project owner or the member handling the task.",
          "Locate the Due Date field.",
          "Select the date by which the task should be completed.",
          "Review your changes.",
          "Save the updated task information.",
        ],
      },
    ],
  },


  // ─────────────────────────────────────────────
  // TEAM
  // ─────────────────────────────────────────────

  {
    title: "Team",
    description: "Invite members and manage team permissions.",
    icon: Users,
    iconClass: "bg-purple-50 text-purple-600",

    overview:
      "Manage the people working in your workspace, invite new members, assign roles, and control access to workspace features.",

    articles: [
      {
        title: "Inviting a team member",
        description:
          "Invite someone to join your workspace and collaborate with your team.",

        steps: [
          "Open the Team section from the dashboard.",
          "Click the Invite Member button.",
          "Enter the person's email address.",
          "Select the appropriate role if your workspace supports multiple roles.",
          "Review the invitation details.",
          "Click Send Invitation.",
          "The invited person will receive an email with instructions to join the workspace.",
        ],
      },

      {
        title: "Managing team members",
        description:
          "View and manage the members currently working in your workspace.",

        steps: [
          "Open the Team section.",
          "Review the list of workspace members.",
          "Select the member you want to manage.",
          "Open the member's available actions.",
          "Review their current role and workspace access.",
          "Make the necessary changes.",
          "Save the updated member information.",
        ],
      },

      {
        title: "Understanding team roles",
        description:
          "Understand how workspace roles control what team members can access and manage.",

        steps: [
          "Open the Team section.",
          "Select a team member.",
          "Review the role currently assigned to them.",
          "Compare the role with the permissions available to that role.",
          "Choose a different role if their responsibilities have changed.",
          "Save the role change.",
        ],
      },

      {
        title: "Changing member permissions",
        description:
          "Update a team member's access when their responsibilities change.",

        steps: [
          "Open the Team section.",
          "Find the team member you want to update.",
          "Open their member settings.",
          "Review their current role or permissions.",
          "Select the appropriate permissions.",
          "Review the changes carefully.",
          "Save the updated permissions.",
        ],
      },

      {
        title: "Removing a team member",
        description:
          "Remove a member from the workspace when they no longer need access.",

        steps: [
          "Open the Team section.",
          "Find the team member you want to remove.",
          "Open the member's management options.",
          "Select Remove Member.",
          "Review the confirmation message.",
          "Confirm that you want to remove the member.",
          "The member will no longer have access to the workspace.",
        ],
      },
    ],
  },


  // ─────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────

  {
    title: "Reports",
    description: "Track progress and understand project performance.",
    icon: BarChart3,
    iconClass: "bg-orange-50 text-orange-600",

    overview:
      "Use reports to understand project progress, task completion, team activity, and overall workspace performance.",

    articles: [
      {
        title: "Understanding project reports",
        description:
          "Learn how to use project reports to understand overall project health and progress.",

        steps: [
          "Open the Reports section.",
          "Select the project you want to analyze.",
          "Review the project overview metrics.",
          "Check task completion and outstanding work.",
          "Review the project's progress indicators.",
          "Use the available filters to narrow the information.",
          "Use the results to identify areas that need attention.",
        ],
      },

      {
        title: "Tracking task completion",
        description:
          "Monitor how many tasks have been completed and how much work remains.",

        steps: [
          "Open the Reports section.",
          "Select the project or workspace you want to analyze.",
          "Locate the task completion information.",
          "Review completed, active, and outstanding tasks.",
          "Compare completed work with the total number of tasks.",
          "Use the results to identify projects that may need attention.",
        ],
      },

      {
        title: "Reading project progress",
        description:
          "Understand the progress indicators used to monitor project completion.",

        steps: [
          "Open the Reports section.",
          "Select a project.",
          "Locate the project progress information.",
          "Review the percentage or progress indicator.",
          "Compare progress with the project's timeline.",
          "Review outstanding tasks if progress is lower than expected.",
        ],
      },

      {
        title: "Team performance",
        description:
          "Review team activity and understand how work is progressing across your workspace.",

        steps: [
          "Open the Reports section.",
          "Open the team or performance view.",
          "Review task activity by team member.",
          "Check completed and outstanding work.",
          "Identify areas where team members may need support.",
          "Use the information to improve task distribution and planning.",
        ],
      },

      {
        title: "Report filters",
        description:
          "Use filters to focus reports on specific projects, team members, statuses, or time periods.",

        steps: [
          "Open the Reports section.",
          "Locate the report filters.",
          "Select the project or workspace you want to analyze.",
          "Choose any relevant status or team member filters.",
          "Set a date range if available.",
          "Apply the filters.",
          "Review the filtered report results.",
        ],
      },
    ],
  },


  // ─────────────────────────────────────────────
  // ACCOUNT
  // ─────────────────────────────────────────────

  {
    title: "Account",
    description: "Manage your profile and account preferences.",
    icon: Settings,
    iconClass: "bg-gray-100 text-gray-600",

    overview:
      "Manage your personal profile, account preferences, password, security settings, and other account-related information.",

    articles: [
      {
        title: "Updating your profile",
        description:
          "Keep your profile information accurate and up to date.",

        steps: [
          "Open your account or profile settings.",
          "Locate the profile information section.",
          "Update your name or other available profile information.",
          "Review the information you entered.",
          "Save your changes.",
        ],
      },

      {
        title: "Changing account settings",
        description:
          "Update the preferences and settings associated with your account.",

        steps: [
          "Open your account settings.",
          "Review the available account preferences.",
          "Choose the setting you want to change.",
          "Update the preference.",
          "Review the changes.",
          "Save your updated account settings.",
        ],
      },

      {
        title: "Managing your password",
        description:
          "Change your account password to keep your account secure.",

        steps: [
          "Open your account settings.",
          "Navigate to the security or password section.",
          "Enter your current password if required.",
          "Enter your new password.",
          "Confirm the new password.",
          "Review the password requirements.",
          "Save the password change.",
        ],
      },

      {
        title: "Account preferences",
        description:
          "Customize how your account behaves and how information is presented to you.",

        steps: [
          "Open your account settings.",
          "Navigate to the preferences section.",
          "Review the available preferences.",
          "Update the settings according to your needs.",
          "Review the selected preferences.",
          "Save your changes.",
        ],
      },

      {
        title: "Security settings",
        description:
          "Review and manage the security options available for your account.",

        steps: [
          "Open your account settings.",
          "Navigate to the Security section.",
          "Review your current security settings.",
          "Update any available security options.",
          "Review the changes carefully.",
          "Save your security settings.",
        ],
      },
    ],
  },


  // ─────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────

  {
    title: "Notifications",
    description: "Manage alerts, reminders, and notifications.",
    icon: Bell,
    iconClass: "bg-red-50 text-red-500",

    overview:
      "Control how and when you receive notifications about projects, tasks, team activity, reminders, and other workspace events.",

    articles: [
      {
        title: "Managing notifications",
        description:
          "Choose which types of workspace activity should generate notifications.",

        steps: [
          "Open your notification settings.",
          "Review the available notification categories.",
          "Enable the notifications you want to receive.",
          "Disable notifications that are not useful to you.",
          "Review your notification preferences.",
          "Save your changes.",
        ],
      },

      {
        title: "Task reminders",
        description:
          "Configure reminders so you don't miss important task deadlines.",

        steps: [
          "Open your notification settings.",
          "Find the task reminder options.",
          "Enable task reminders.",
          "Choose the reminder timing if the option is available.",
          "Review your reminder preferences.",
          "Save your changes.",
        ],
      },

      {
        title: "Project notifications",
        description:
          "Control notifications related to project activity and changes.",

        steps: [
          "Open your notification settings.",
          "Locate the project notification options.",
          "Review the available project events.",
          "Enable notifications for important project activity.",
          "Disable events that you do not need to follow.",
          "Save your notification preferences.",
        ],
      },

      {
        title: "Team activity alerts",
        description:
          "Stay informed about important activity from other workspace members.",

        steps: [
          "Open your notification settings.",
          "Locate the team activity notification options.",
          "Review the available team events.",
          "Enable the alerts you want to receive.",
          "Disable unnecessary alerts to reduce notification noise.",
          "Save your changes.",
        ],
      },

      {
        title: "Notification preferences",
        description:
          "Customize how you receive notifications across your workspace.",

        steps: [
          "Open your notification settings.",
          "Review the available notification preferences.",
          "Choose which events should generate notifications.",
          "Configure the available delivery options.",
          "Review your final notification configuration.",
          "Save your preferences.",
        ],
      },
    ],
  },
];
const selectedCategory = ref<HelpCategory | null>(null);

function openCategory(category: HelpCategory) {
  selectedCategory.value = category;
}

function closeCategory() {
  selectedCategory.value = null;
}
</script>

<template>
  <section>
    <!-- Section heading -->
    <div class="mb-4">
      <h2 class="text-[17px] font-semibold text-gray-900">
        Browse help topics
      </h2>

      <p class="mt-1 text-sm text-[#7890ad]">
        Find answers and guides for managing your workspace.
      </p>
    </div>

    <!-- Categories -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <button v-for="category in categories" :key="category.title" type="button" class="
                    group
                    flex
                    min-h-36.25
                    flex-col
                    items-start
                    rounded-xl
                    border
                    border-[#dfe5ec]
                    bg-white
                    p-5
                    text-left
                    transition-all
                    duration-200
                    hover:border-blue-300
                    hover:shadow-[0_2px_8px_rgba(40,100,180,0.08)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-100
                " @click="openCategory(category)">
        <!-- Icon -->
        <div :class="[
          'flex h-10 w-10 items-center justify-center rounded-lg',
          category.iconClass,
        ]">
          <component :is="category.icon" :size="19" :stroke-width="1.8" />
        </div>

        <!-- Content -->
        <div class="mt-4">
          <h3 class="
                            text-[16px]
                            font-semibold
                            text-gray-900
                            transition-colors
                            group-hover:text-blue-600
                        ">
            {{ category.title }}
          </h3>

          <p class="
                            mt-1
                            text-sm
                            leading-5
                            text-[#7890ad]
                        ">
            {{ category.description }}
          </p>
        </div>
      </button>
    </div>

    <!-- Shared dialog -->
    <HelpTopicDialog :category="selectedCategory" :open="!!selectedCategory" @close="closeCategory" />
  </section>
</template>
