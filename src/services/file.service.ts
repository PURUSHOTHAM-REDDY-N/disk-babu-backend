// src/services/video.service.ts
import { File } from '@prisma/client';
import * as videoProvider from '../providers/file.provider';

export const createVideo = async (request: Omit<File, 'id' | 'createdAt' | 'updatedAt'>): Promise<File> => {
  return await videoProvider.createVideo(request);
};

export const getById = async (id: string): Promise<File> => {
  return await videoProvider.getById(id);
};
