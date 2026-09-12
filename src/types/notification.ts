// src/types/notification.ts

import type { User } from "./user";
import type { Workspace } from "./workspace";
import type { Project } from "./project";
import type { Task } from "./task";
import type { Comment } from "./comment";

export interface Notification {
    id: number;

    type: string;

    title: string;

    message: string;

    isRead: boolean;

    createdAt: string;

    workspace: Workspace;

    recipient: User;

    actor: User | null;

    project: Project | null;

    task: Task | null;

    comment: Comment | null;
}