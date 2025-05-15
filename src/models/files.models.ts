import { FileAnalytics,File } from "@prisma/client";

export interface GetAllFilesByUserRequest {
    user_id: string;
}

export interface GetAllFilesByUserResponse {
    data: File[];
}