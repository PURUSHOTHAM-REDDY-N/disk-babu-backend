// src/services/file-analytics.service.ts
import { FileAnalytics } from "@prisma/client";
import * as provider from "../providers/file-analytics.provider";
import { getUserFileUploadCountByMonth } from "../providers/file.provider";

export const createOrUpdateDailyAnalytics = async (
  fileId: string,
  userId: string
) => {
  return provider.upsertDailyAnalytics(fileId, userId);
};

export const getAnalyticsForDate = async (fileId: string, userId: string, date: Date) => {
  return provider.getAnalyticsByDate(fileId, userId, date);
};

// gives daily total analytics for for a particular day
export const getUserDailyTotals = async (
  userId: string,
  date: string,
) => {
  return await provider.getUserDailyTotalAnalytics(userId, date);
};

// gives daily analytics for entire month
export const getUserMonthlyAnalytics = async (userId: string, month: Date) => {
  return await provider.getUserMonthlyAnalytics(userId, month);
};

export const getUserMonthlyTotals = async (userId: string, month: Date) => {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const [analytics, uploadCount] = await Promise.all([
    provider.getUserFileAnalyticsByMonth(userId, startOfMonth, endOfMonth),
    getUserFileUploadCountByMonth(userId, startOfMonth, endOfMonth),
  ]);

  return {
    month: month.toISOString().slice(0, 7),
    views: analytics.views,
    earnings: analytics.earnings,
    uploads: uploadCount,
  };
};



