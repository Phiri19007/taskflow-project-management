import api from "./api";

export const notificationService = {
  getMine() {
    return api.get("/notifications/me");
  },

  getUnread() {
    return api.get("/notifications/unread");
  },

  markAsRead(id: number) {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return api.patch("/notifications/read-all");
  },

  delete(id: number) {
    return api.delete(`/notifications/${id}`);
  },

  async getProjectActivity(
    projectId: number
  ) {

    return api.get(
      `/notifications/projects/${projectId}`
    );

  }
};