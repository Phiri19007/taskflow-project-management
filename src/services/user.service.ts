// user.service.ts

import api from "./api";

export const userService = {
  getCurrentUser() {
    return api.get("/users/me");
  },

  updateProfile(data: any) {
    return api.patch("/users/me", data);
  },

  updateAvatar(formData: FormData) {
    return api.post("/users/me/avatar", formData);
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }) {
    return api.patch("/users/password", payload);
  },

};