import type { User } from "./user";
import type { Workspace } from "./workspace";

export enum WorkspaceRole {
    Owner = "OWNER",
    Admin = "ADMIN",
    Member = "MEMBER",
    Guest = "GUEST",
}

export interface WorkspaceMember {
  id: number;

  role: WorkspaceRole;

  joinedAt: string;

  workspace: Workspace;

  user: User;
}