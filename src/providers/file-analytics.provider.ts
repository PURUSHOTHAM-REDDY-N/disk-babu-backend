// src/providers/file-analytics.provider.ts
import moment from "moment-timezone";
import prisma from "../../prisma/prisma-client";
import { getUserDailyFileCount } from "./file.provider";
import { updateWalletAvailableBalance } from "./wallet.provider";

export const upsertDailyAnalytics = async (fileId: string, userId: string) => {
  const RATE_PER_VIEW = 0.002;
  const REFERRAL_RATE_PER_VIEW = 0.0001;

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
    updateWalletAvailableBalance(userId, "increment", RATE_PER_VIEW),
  ]);
  // this is to handle the case where we caliculate referral earnings
  // for the original owner of the file if it was uploaded by a different user
  const originalOwner = file?.originalOwner;
  const currentOwner = file?.currentOwner;
  if (
    file.originalUserFileID &&
    originalOwner &&
    originalOwner !== currentOwner
  ) {
    const [fileOwnerAnalytics, ownerFile] = await Promise.all([
      prisma.fileAnalytics.upsert({
        where: {
          fileId_userId_date: {
            fileId: file.originalUserFileID,
            userId: originalOwner,
            date: today,
          },
        },
        update: {
          referalEarnings: { increment: REFERRAL_RATE_PER_VIEW },
        },
        create: {
          fileId: file.originalUserFileID,
          userId: originalOwner,
          date: today,
          views: 0,
          referalEarnings: REFERRAL_RATE_PER_VIEW,
        },
      }),
      prisma.file.update({
        where: { id: file.originalUserFileID },
        data: { referralEarnings: { increment: REFERRAL_RATE_PER_VIEW } },
      }),
      updateWalletAvailableBalance(userId, "increment", REFERRAL_RATE_PER_VIEW),
    ]);
  }

  return fileAnalytics;
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
        currentOwner: userId,
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
  date: string
) => {
  const startOfMonth = moment.utc(date).startOf("month").toISOString();
  const endOfMonth = moment.utc(date).endOf("month").toISOString();
  const result = await prisma.fileAnalytics.aggregate({
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

  return {
    views: result._sum.views || 0,
    earnings: result._sum.earnings || 0,
  };
};
