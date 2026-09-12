import type { Project } from "./project";
import type { User } from "./user";

export enum TaskStatus {
    Todo = "TODO",
    InProgress = "IN_PROGRESS",
    Review = "REVIEW",
    Done = "DONE",
}

export enum TaskPriority {
    Low = "LOW",
    Medium = "MEDIUM",
    High = "HIGH",
    Critical = "CRITICAL",
}

export interface Task {
    id: number;

    title: string;

    description: string | null;

    status: TaskStatus;

    priority: TaskPriority;

    dueDate: string | null;

    createdAt: string;

    updatedAt: string;

    project: Project;

    createdBy: User;

    assignedTo: User | null;
}

export interface CreateTaskData {
    title: string;

    description: string | null;

    status: TaskStatus;

    priority: TaskPriority;

    dueDate: string | null;

    assignedToId: number | null;
}

export interface UpdateTaskData {
    title: string;

    description: string | null;

    status: TaskStatus;

    priority: TaskPriority;

    dueDate: string | null;

    assignedToId?: number | null;
}