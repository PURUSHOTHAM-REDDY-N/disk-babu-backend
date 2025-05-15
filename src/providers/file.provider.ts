// src/providers/video.provider.ts
import { File } from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import moment from "moment";

export const createVideo = async (
  request: Omit<File, "id" | "createdAt" | "updatedAt" | "status">
): Promise<File> => {
  const today = moment.utc().toISOString();
  const todayStart =moment.utc().startOf("day").toISOString();
  const video = await prisma.file.create({
    data: request,
  });
  await prisma.fileAnalytics.upsert({
    where: {
      fileId_userId_date: {
        fileId: video.id,
        userId: request.originalOwner,
        date: today,
      },
    },
    update: {},
    create: {
      fileId: video.id,
      userId: request.originalOwner,
      date: todayStart,
      views: 0,
      earnings: 0,
    },
  });

  return video;
};

export const getFilesByUser = async (id: string): Promise<File[]> => {
  const video = await prisma.file.findMany({
    where: { originalOwner: id },
  });
console.log("video", video);
  return video;
};

export const getUserDailyFileCount = async (userId: string, date: string) => {
  const count = await prisma.file.count({
    where: {
      originalOwner: userId,
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
    const dateStr = entry.createdAt.toISOString().split("T")[0];
    filesMap.set(dateStr, entry._count._all);
  }

  return filesMap;
};

// This function returns the count of files uploaded by a user in a given month
export const getUserFileUploadCountByMonth = async (
  userId: string,
  date: Date
) => {
  const startOfMonth = moment
    .tz(date, "Asia/Kolkata")
    .startOf("month")
    .utc()
    .toDate();
  const endOfMonth = moment
    .tz(date, "Asia/Kolkata")
    .endOf("month")
    .utc()
    .toDate();
  const count = await prisma.file.count({
    where: {
      originalOwner: userId,
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    },
  });

  return count;
};
