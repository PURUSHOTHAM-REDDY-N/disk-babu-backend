// src/services/video.service.ts
import { File } from '@prisma/client';
import * as fileProvider from '../providers/file.provider';
import { PagedDataResult } from '../models/interfaces/base/pagedDataResult';

export const createFile = async (request:Omit<File, "id" | "createdAt" | "updatedAt" | "status">): Promise<File> => {
  return await fileProvider.createFile(request);
};

export const getFilesByUser = async (
  userId: string,
  page: number,
  pageSize: number
): Promise<PagedDataResult<File>> => {
  const skip = (page - 1) * pageSize;
  const { data, total } = await fileProvider.getFilesByUser(userId, skip, pageSize);
  return { data, total };
};