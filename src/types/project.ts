import type { Workspace } from "./workspace";
import type { User } from "./user";


export enum ProjectStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
  ON_HOLD = "ON_HOLD",
}


export interface Project {

  id: number;

  name: string;

  description: string | null;

  status: ProjectStatus;

  startDate: string | null;

  endDate: string | null;

  createdAt: string;

  updatedAt: string;

  createdBy: User;
  createdById: number;

  workspace?: Workspace;

}

export interface UpdateProject { 
  id: number; 
  name: string; 
  description: string | null; 
  status: ProjectStatus; 
  startDate: string | null; 
  endDate: string | null; 
}