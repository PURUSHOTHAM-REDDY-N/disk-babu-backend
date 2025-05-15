// src/providers/file-analytics.provider.ts
import moment from "moment-timezone";
import prisma from "../../prisma/prisma-client";
import { getUserDailyFileCount } from "./file.provider";

const RATE_PER_VIEW = 0.002;

export const upsertDailyAnalytics = async (fileId: string, userId: string) => {
  const today = moment.utc().startOf("day").toISOString(); // UTC start
  const [fileAnalytics, file] = await Promise.all([
    prisma.fileAnalytics.upsert({
      where: {
        fileId_userId_date: { fileId, userId, date: today },
      },
      update: {
        views: { increment: 1 },
        earnings: { increment: RATE_PER_VIEW },
      },
      create: {
        fileId,
        userId,
        date: today,
        views: 1,
        earnings: RATE_PER_VIEW,
      },
    }),
    prisma.file.update({
      where: { id: fileId },
      data: { totalViews: { increment: 1 } },
    }),
  ]);

  return fileAnalytics;
};

export const getAnalyticsByDateAndFile = async (
  fileId: string,
  userId: string,
  date: Date
) => {
  // const day = new Date(date);
  // day.setUTCHours(0, 0, 0, 0); // Normalize to start of that day
  const utcDate = moment.utc(date).startOf("day").toISOString();
  return prisma.fileAnalytics.findUnique({
    where: {
      fileId_userId_date: { fileId, userId, date: utcDate },
    },
  });
};

export const getUserDailyTotalAnalytics = async (
  userId: string,
  date: string
) => {
  const todayStart = moment.utc(date).startOf("day").toISOString();
  const [analytics, fileCount] = await Promise.all([
    prisma.fileAnalytics.aggregate({
      _sum: {
        views: true,
        earnings: true,
      },
      where: {
        userId,
        date: {
          equals: todayStart,
        },
      },
    }),
    getUserDailyFileCount(userId, todayStart),
  ]);

  return {
    totalViews: analytics._sum.views || 0,
    totalEarnings: analytics._sum.earnings || 0,
    totalFilesUploaded: fileCount,
  };
};

export const getUserAnalyticsByMonth = async (userId: string, date: Date) => {
  const startOfMonth = moment.utc(date).startOf("month").toISOString();

  const endOfMonth = moment.utc(date).endOf("month").toISOString();

  // Grouped file analytics
  const [analytics, fileCount] = await Promise.all([
    prisma.fileAnalytics.groupBy({
      by: ["date"],
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: {
        views: true,
        earnings: true,
      },
    }),
    prisma.file.groupBy({
      by: ["uploadedDate"],
      where: {
        originalOwner: userId,
        uploadedDate: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const transformedAnalytics = analytics.map((entry) => ({
    date: entry.date,
    views: entry._sum.views ?? 0,
    earnings: entry._sum.earnings ?? 0,
  }));

  const transformedFileCount = fileCount.map((entry) => ({
    date: entry.uploadedDate,
    count: entry._count._all ?? 0,
  }));

  const combinedAnalytics = transformedAnalytics.map((a) => {
    const match = transformedFileCount.find(
      (f) => f.date.toString() === a.date.toISOString()
    );
    return {
      ...a,
      toatalFileUploads: match?.count ?? 0, // default to 0 if no match
    };
  });
  return combinedAnalytics;
};

// total views and earnings for a given user in a given month
export const getUserMonthlyAnalyticsTotals = async (
  userId: string,
  start: Date,
  end: Date
) => {
  const result = await prisma.fileAnalytics.aggregate({
    where: {
      userId,
      date: {
        gte: start,
        lt: end,
      },
    },
    _sum: {
      views: true,
      earnings: true,
    },
  });

  return {
    views: result._sum.views || 0,
    earnings: result._sum.earnings || 0,
  };
};
