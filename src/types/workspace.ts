import type { User } from "./user";

export interface Workspace {
  id: number;
  name: string;
  description: string | null;

  owner: User;

  createdAt: string;
  updatedAt: string;
}