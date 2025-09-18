// src/providers/video.provider.ts
import { File, FileSource } from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import moment from "moment";

export const createFile = async (
  request: Omit<File, "id" | "createdAt" | "updatedAt" | "status">
): Promise<File> => {
  const today = moment.utc().toISOString();
  const todayStart = moment.utc().startOf("day").toISOString();
  const file = await prisma.file.create({
    data: request,
  });
  await prisma.fileAnalytics.upsert({
    where: {
      fileId_userId_date: {
        fileId: file.id,
        userId: request.currentOwner,
        date: today,
      },
    },
    update: {},
    create: {
      fileId: file.id,
      userId: request.currentOwner,
      date: todayStart,
      views: 0,
      earnings: 0,
    },
  });

  return file;
};
export const cloneFile =  async (
  originalFileId: string,
  userId:string
): Promise<File> => {

  const originalFile = await getFileById(originalFileId)
  if (!originalFile) {
    throw new Error("File not found");
  }
  const tailoredOriginalFile:Omit<File, "id" | "createdAt" | "updatedAt" | "status"> = {
    ...originalFile
  }
  const today = moment.utc().toISOString();
  const todayStart = moment.utc().startOf("day").toISOString();
  const clonedFile = await prisma.file.create({
    data: {
      ...tailoredOriginalFile,
      source:FileSource.CLONE, // Set the source to CLONE
      currentOwner: userId, // Keep the current owner the same
      originalOwner: originalFile?.currentOwner, // Set the original owner to the current owner
      originalUserFileID: originalFile?.id, // Assuming you want to keep the original file ID
      createdAt: new Date(), // Set the creation date to now
      updatedAt: new Date(), // Set the update date to now
    },
  });
  await prisma.fileAnalytics.upsert({
    where: {
      fileId_userId_date: {
        fileId: clonedFile.id,
        userId: clonedFile.currentOwner,
        date: today,
      },
    },
    update: {},
    create: {
      fileId: clonedFile.id,
      userId: clonedFile.currentOwner,
      date: todayStart,
      views: 0,
      earnings: 0,
    },
  });

  return clonedFile;
};
export const getFileById = async (id: string): Promise<File | null> => {
  const file = await prisma.file.findUnique({ where: { id } });
  return file;
}

export const getFilesByUser = async (
  userId: string,
  skip: number,
  take: number
): Promise<{ data: File[]; total: number }> => {
  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where: { originalOwner: userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.file.count({ where: { originalOwner: userId } }),
  ]);

  return { data: files, total };
};

export const getUserDailyFileCount = async (userId: string, date: string) => {
  const count = await prisma.file.count({
    where: {
      currentOwner: userId,
      uploadedDate: {
        equals: date,
      },
    },
  });

  return count;
};

export const getUserFileUploadsByDate = async (
  userId: string,
  start: Date,
  end: Date
) => {
  const files = await prisma.file.groupBy({
    by: ["createdAt"],
    where: {
      currentOwner: userId,
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
    const dateStr = entry.createdAt.toISOString().split("T")[0];
    filesMap.set(dateStr, entry._count._all);
  }

  return filesMap;
};

// This function returns the count of files uploaded by a user in a given month
export const getUserFileUploadCountByMonth = async (
  userId: string,
  date: string
) => {
  const startOfMonth = moment.utc(date).startOf("month").toISOString();
  const endOfMonth = moment.utc(date).endOf("month").toISOString();
  const count = await prisma.file.count({
    where: {
      currentOwner: userId,
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    },
  });

  return count;
};
