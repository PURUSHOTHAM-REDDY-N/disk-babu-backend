// src/providers/file-analytics.provider.ts
import prisma from "../../prisma/prisma-client";
import { getUserDailyFileCount, getUserFileUploadsByDate } from "./file.provider";

const RATE_PER_VIEW = 0.002;

export const upsertDailyAnalytics = async (fileId: string, userId: string) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Normalize to start of day

  return prisma.fileAnalytics.upsert({
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
  });
};

export const getAnalyticsByDate = async (
  fileId: string,
  userId: string,
  date: Date
) => {
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0); // Normalize to start of that day

  return prisma.fileAnalytics.findUnique({
    where: {
      fileId_userId_date: { fileId, userId, date: day },
    },
  });
};

export const getUserDailyTotalAnalytics = async (
  userId: string,
  date: Date
) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [analytics, fileCount] = await Promise.all([
    prisma.fileAnalytics.aggregate({
      _sum: {
        views: true,
        earnings: true,
      },
      where: {
        userId,
        date: {
          gte: start,
          lt: end,
        },
      },
    }),
    getUserDailyFileCount(userId, date),
  ]);

  return {
    totalViews: analytics._sum.views || 0,
    totalEarnings: analytics._sum.earnings || 0,
    totalFilesCreated: fileCount,
  };
};


export const getUserMonthlyAnalytics = async (userId: string, month: Date) => {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  // Get daily file analytics
  const analytics = await prisma.fileAnalytics.groupBy({
    by: ['date'],
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
  });

  const analyticsMap = new Map<string, { views: number; earnings: number }>();
  for (const entry of analytics) {
    const dateStr = entry.date.toISOString().split('T')[0];
    analyticsMap.set(dateStr, {
      views: entry._sum.views || 0,
      earnings: entry._sum.earnings || 0,
    });
  }

  // Get uploaded file counts per day
  const filesMap = await getUserFileUploadsByDate(userId, startOfMonth, endOfMonth);

  // Build result for each day
  const result: {
    date: string;
    views: number;
    earnings: number;
    uploads: number;
  }[] = [];

  for (
    let d = new Date(startOfMonth);
    d < endOfMonth;
    d.setDate(d.getDate() + 1)
  ) {
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      views: analyticsMap.get(dateStr)?.views || 0,
      earnings: analyticsMap.get(dateStr)?.earnings || 0,
      uploads: filesMap.get(dateStr) || 0,
    });
  }

  return result;
};
