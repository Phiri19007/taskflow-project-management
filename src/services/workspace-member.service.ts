import api from "./api";

export const workspaceMemberService = {

  getMembers(workspaceId: string) {
    return api.get(
      `/workspace-members/${workspaceId}/members`
    );
  },


  invite(
    workspaceId: string,
    data: any
  ) {
    return api.post(
      `/workspaces/${workspaceId}/members`,
      data
    );
  },


  updateRole(
    workspaceId: string,
    memberId: string,
    data: {
      role: string;
    }
  ) {
    return api.patch(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      data
    );
  },


  remove(
    workspaceId: string,
    memberId: string
  ) {
    return api.delete(
      `/workspaces/${workspaceId}/members/${memberId}`
    );
  },

};
