// src/types/comment.ts

import type { Task } from "./task";
import type { User } from "./user";

export interface Comment {
    id: number;
    message: string;
    createdAt: string;

    taskId: number;
    userId: number;

    task?: Task;
    user?: User;
}