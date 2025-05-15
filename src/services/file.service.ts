// src/services/video.service.ts
import { File } from '@prisma/client';
import * as videoProvider from '../providers/file.provider';

export const createVideo = async (request:Omit<File, "id" | "createdAt" | "updatedAt" | "status">): Promise<File> => {
  return await videoProvider.createVideo(request);
};

export const getFilesByUser = async (id: string): Promise<Omit<File[], 'id' | 'createdAt' | 'updatedAt'>> => {
  return await videoProvider.getFilesByUser(id);
};
