// src/providers/video.provider.ts
import { File } from '@prisma/client';
import prisma from '../../prisma/prisma-client';

export const createVideo = async (request: Omit<File, 'id' | 'createdAt' | 'updatedAt'>): Promise<File> => {
  const video = await prisma.file.create({
    data: request,
  });

  return video;
};

export const getById = async (id: string): Promise<File> => {
  const video = await prisma.file.findUniqueOrThrow({
    where: { id },
  });

  return video;
};


export const getUserDailyFileCount = async (userId: string, date: string) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const count = await prisma.file.count({
    where: {
      originalOwner: userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return count;
};


export const getUserFileUploadsByDate = async (userId: string, start: Date, end: Date) => {
  const files = await prisma.file.groupBy({
    by: ['createdAt'],
    where: {
      originalOwner: userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    _count: {
      _all: true,
    },
  });

  const filesMap = new Map<string, number>();
  for (const entry of files) {
    const dateStr = entry.createdAt.toISOString().split('T')[0];
    filesMap.set(dateStr, entry._count._all);
  }

  return filesMap;
};

// This function returns the count of files uploaded by a user in a given month
export const getUserFileUploadCountByMonth = async (userId: string, start: Date, end: Date) => {
  const count = await prisma.file.count({
    where: {
      originalOwner: userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return count;
};
