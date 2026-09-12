import { defineStore } from "pinia";
import { ref } from "vue";

import { taskService } from "@/services/task.service";

import type {
  CreateTaskData,
  Task,
  UpdateTaskData,
} from "@/types/task";

export const useTaskStore = defineStore("tasks", () => {

  const tasks = ref<Task[]>([]);

  // =========================================================
  // Fetch Tasks
  // =========================================================

  async function fetchTasks(
    projectId: number,
  ) {
    const { data } =
      await taskService.getByProject(
        projectId,
      );

    tasks.value = data;
  }
async function fetchProjectReportTasks(
    projectId: number,
) {
    const { data } =
        await taskService.getByProject(
            projectId,
        );

    return data;
}
  // =========================================================
  // Create Task
  // =========================================================

  async function createTask(
    projectId: number,
    taskData: CreateTaskData,
  ) {
    const { data: createdTask } =
      await taskService.create(
        projectId,
        taskData,
      );

    tasks.value.push(
      createdTask,
    );

    return createdTask;
  }

  // =========================================================
  // Update Task
  // =========================================================

  async function updateTask(
    taskId: number,
    data: UpdateTaskData,
  ) {
    const { data: updatedTask } =
      await taskService.update(
        taskId,
        data,
      );

    // Update local store
    const index =
      tasks.value.findIndex(
        task => task.id === taskId,
      );

    if (index !== -1) {
      tasks.value[index] = updatedTask;
    }

    return updatedTask;
  }

  async function deleteTask(
    taskId: number,
  ) {

    await taskService.delete(
      taskId,
    );

    // Remove the task from the local store
    tasks.value =
      tasks.value.filter(
        task => task.id !== taskId,
      );

  }

  // =========================================================
  // Clear
  // =========================================================

  function clear() {
    tasks.value = [];
  }

  return {
    tasks,
    fetchTasks,
    updateTask,
    createTask,
    deleteTask,
    clear,
    fetchProjectReportTasks,
  };
});