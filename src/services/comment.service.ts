import api from "./api";

export const commentService = {
  getByTask(taskId: string) {
    return api.get(`/tasks/${taskId}/comments`);
  },

  create(taskId: string, data: any) {
    return api.post(`/tasks/${taskId}/comments`, data);
  },
};