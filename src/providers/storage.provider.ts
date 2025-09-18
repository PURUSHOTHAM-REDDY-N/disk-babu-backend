import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import s3 from "../../aws.config";
import { OutputType } from "aws-sdk/clients/appsync";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const createBucket = async (
  bucketName: string
): Promise<OutputType | undefined> => {
  try {
    const command = new CreateBucketCommand({ Bucket: bucketName });
    const response = await s3.send(command);
    console.log("Bucket created successfully:", response);
    const jsonResponse = JSON.stringify(response);
    return jsonResponse as OutputType;
  } catch (error) {
    console.error("Error creating bucket:", error);
  }
};

export const getBukcetByName = async (bucketName: string): Promise<boolean> => {
  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    const response = await s3.send(command);
    console.log("Bucket exists:", response);
    if (response.$metadata.httpStatusCode === 200) {
      return true;
    }
    return false;
  } catch (error: any) {
    throw new Error(
      `Bucket "${bucketName}" does not exist. Error: ${error.message}`
    );
  }
};

export const createAndSetBucketCorsPolicy = async (
  bucketName: string,
  corsRules?: any
): Promise<boolean> => {
  try {
    const result = await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: corsRules || [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
              AllowedOrigins: ["http://localhost:5173"], // Replace with your domain
              ExposeHeaders: ["ETag", "x-amz-request-id", "x-amz-id-2"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );
    if (result) {
      return true;
    }
    return false;
    console.log("✅ CORS configuration applied:", result);
  } catch (error) {
    console.error("❌ Failed to apply CORS configuration:", error);
    return false;
  }
};

export const getPresignedUploadUrl = async (
  bucketName: string,
  fileName: string,
  expiredIn: number = 7200
) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: "video/*",
  });

  const url = await getSignedUrl(s3, command, { expiresIn: expiredIn });
  return url;
};

export const upsertBukcetWithCorsPolicy = async (bucketName: string) => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (err: any) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      await createAndSetBucketCorsPolicy(bucketName);
      await new Promise((res) => setTimeout(res, 5000));
    } else {
      throw err;
    }
  }
};

export const getPresignedDownloadUrl = async (
  bucketName: string,
  fileName: string,
  expiresIn: number = 7200
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });
  console.log("Generating presigned URL for download:");
  const url = await getSignedUrl(s3, command, { expiresIn: expiresIn });
  console.log("Presigned URL generated:", url);
  return url;
};
