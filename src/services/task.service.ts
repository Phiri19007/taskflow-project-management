import api from "./api";
import type { CreateTaskData, TaskStatus } from "@/types/task";

export const taskService = {

  getByProject(projectId: number) {
    return api.get(`/tasks/project/${projectId}`);
  },

  create(
    projectId: number,
    data: CreateTaskData,
  ) {
    return api.post(
      '/tasks',
      {
        ...data,
        projectId,
      },
    );
  },

  update(
    taskId: number,
    data: {
      status: TaskStatus;
    },
  ) {
    return api.patch(
      `/tasks/${taskId}`,
      data,
    );
  },

  async delete(
  taskId: number,
) {
  return api.delete(
    `/tasks/${taskId}`,
  );
}


};