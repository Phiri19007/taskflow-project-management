import api from "./api";

export const workspaceService = {
  getMine() {
    return api.get("/workspaces/me");
  },

  async invite(
    workspaceId: number,
    email: string
  ) {

    return api.post(
      `/workspaces/${workspaceId}/members/invite`,
      {
        email
      }
    );

  },

  async acceptInvite(workspaceId: number, notificationId: number) {
    return api.post(
      `/workspaces/${workspaceId}/members/accept-invite`,
      {
        notificationId
      }
    );

  },


  getById(id: number) {
    return api.get(`/workspaces/${id}`);
  },

  create(data: any) {
    return api.post("/workspaces", data);
  },

  update(id: string, data: any) {
    return api.patch(`/workspaces/${id}`, data);
  },

  delete(id: number) {
    return api.delete(`/workspaces/${id}`);
  },
};