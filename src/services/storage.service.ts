import * as storageProvider from "../providers/storage.provider";
import {
  getCurrentMonthAndYear,
  getMonthAndYearByDate,
} from "../utils/basic-utils";

export const getBukcetByName = async (bucketName: string): Promise<any> => {
  const response = await storageProvider.getBukcetByName(bucketName);
  return response;
};

export const getPresignedUploadUrl = async (
  fileName: string,
  userId: string
): Promise<any> => {
  const currentMonthBucketName = `disk-babu-${getCurrentMonthAndYear()}`;

  await storageProvider.upsertBukcetWithCorsPolicy(currentMonthBucketName);

  const timestamp = Date.now();

  // 🔧 Replace spaces with underscores
  const sanitizedFileName = fileName.replace(/\s+/g, "_");

  const storageKey = `${userId}/${timestamp}#${sanitizedFileName}`;

  const preSignedUrl = await storageProvider.getPresignedUploadUrl(
    currentMonthBucketName,
    storageKey
  );

  return { preSignedUrl, storageKey };
};


export const getPresignedDownloadUrl = async (
  fileName: string,
  date: Date
): Promise<string> => {
  const fileUploadBucketName = `disk-babu-${getMonthAndYearByDate(date)}`;
  const url = await storageProvider.getPresignedDownloadUrl(
    fileUploadBucketName,
    fileName
  );
  return url;
};

export const createAndSetBucketCorsPolicy = async (
  bucketName: string,
  corsRules?: any
): Promise<boolean> => {
  const createAndSetBucketCorsPolicy =
    await storageProvider.createAndSetBucketCorsPolicy(bucketName, corsRules);
  return createAndSetBucketCorsPolicy;
};
