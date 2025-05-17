// src/services/file-analytics.service.ts
import { FileAnalytics } from "@prisma/client";
import * as provider from "../providers/file-analytics.provider";
import { getUserFileUploadCountByMonth } from "../providers/file.provider";
import moment from "moment";

export const createOrUpdateDailyAnalytics = async (
  fileId: string,
  userId: string
) => {
  return provider.upsertDailyAnalytics(fileId, userId);
};

export const getAnalyticsByDateAndFile = async (fileId: string, userId: string, date: Date) => {
  return provider.getAnalyticsByDateAndFile(fileId, userId, date);
};

// gives daily total analytics for for a particular day
export const getUserAnalyticsByDate = async (
  userId: string,
  date: string,
) => {
  return await provider.getUserDailyTotalAnalytics(userId, date);
};

// gives daily analytics for entire month
export const getUserAnalyticsByMonth = async (userId: string, date:Date) => {
  return await provider.getUserAnalyticsByMonth(userId, date);
};

export const getUserMonthlyAnalyticsTotals = async (userId: string, date: string) => {

  

  const [analytics, uploadCount] = await Promise.all([
    provider.getUserMonthlyAnalyticsTotals(userId, date),
    getUserFileUploadCountByMonth(userId, date),
  ]);

  return {
    month: moment(date).toISOString(),
    views: analytics.views,
    earnings: analytics.earnings,
    uploads: uploadCount,
  };
};



