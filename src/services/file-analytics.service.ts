// src/services/file-analytics.service.ts
import { FileAnalytics } from "@prisma/client";
import * as provider from "../providers/file-analytics.provider";

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
  date: Date
) => {
  return await provider.getUserDailyTotalAnalytics(userId, date);
};

// gives daily analytics for entire month
export const getUserMonthlyAnalytics = async (userId: string, month: Date) => {
  return await provider.getUserMonthlyAnalytics(userId, month);
};



