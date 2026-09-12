<script setup lang="ts">
import { ref } from "vue";
import FAQItem from "./FAQItem.vue";

const openIndex = ref<number | null>(null);

const faqs = [
  {
    question: "How do I create a new project?",
    answer:
      "Open Projects from the dashboard sidebar and click New Project. Enter the project name, add an optional description, set the start and end dates if needed, and click Create Project.",
  },
  {
    question: "How do I create a task?",
    answer:
      "Open the project where you want to create the task, then select the Board, Tasks, or Calendar tab. Click Add Task, enter the task details, set the status, priority, and due date, assign a workspace member, and click Create Task.",
  },
  {
    question: "How do I add someone to my workspace?",
    answer:
      "The person must already have an account on the platform. Open the Teams section, click Add Workspace Member, enter their account email address, and click Send Invite. They must accept the invitation before they become a workspace member.",
  },
  {
    question: "How do I assign a task to a team member?",
    answer:
      "The person must first be a workspace member. After they accept the workspace invitation, open the project containing the task, select the Board, Tasks, or Calendar tab, and use the Assign field to select the workspace member.",
  },
  {
    question: "Can I change the status of a task?",
    answer:
      "Yes. Open the project containing the task, select the Tasks or Calendar tab, and click the task. Select Manage, update the Status field, and save your changes.",
  },
  {
    question: "How do I update or archive a project?",
    answer:
      "Open Projects and select the project you want to manage. Click Update to change the project details or status. To archive the project, select Archived from the Project Status selector and save your changes. Only the project owner can update project details.",
  },
  {
    question: "How do I view project progress and reports?",
    answer:
      "Open the Reports section and select the project or workspace you want to analyze. You can review project progress, task completion, outstanding work, team activity, and other available performance information.",
  },
  {
    question: "How do I manage my account and notifications?",
    answer:
      "Open your account settings to update your profile, password, security settings, and preferences. To manage alerts and reminders, open your notification settings and choose which project, task, and team activity notifications you want to receive.",
  },
];


function toggleFAQ(index: number) {
  openIndex.value = openIndex.value === index ? null : index;
}
</script>

<template>
  <section class="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
    <div class="mb-2">
      <h2 class="text-lg font-semibold text-gray-900">
        Frequently asked questions
      </h2>

      <p class="text-sm text-gray-500 mt-1">
        Quick answers to common questions.
      </p>
    </div>

    <div class="mt-4">
      <FAQItem
        v-for="(faq, index) in faqs"
        :key="faq.question"
        :question="faq.question"
        :answer="faq.answer"
        :open="openIndex === index"
        @toggle="toggleFAQ(index)"
      />
    </div>
  </section>
</template>