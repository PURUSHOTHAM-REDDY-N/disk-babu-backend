import {PutObjectCommand, PutObjectCommandInput} from "@aws-sdk/client-s3";
import s3 from '../../aws.config';
import * as s3Helper from "../helpers/s3.helper"

const s3ImagesBucketName = process.env.S3_IMAGES_BUCKET!
const s3ImagesDomainUrl = process.env.S3_IMAGES_DOMAIN_URL!
const s33dModelsBucketName = process.env.S3_3D_MODELS_BUCKET!
const s3AclConfig = process.env.S3_ACL_CONFIG!
const s3Region = process.env.S3_REGION!
export const uploadImage = async (imageFile: Express.Multer.File): Promise<string> => {
    try {
        return await uploadImageToS3(imageFile, s3ImagesBucketName, s3ImagesDomainUrl);
    } catch (error) {
        console.error("Error uploading imageFile to S3:", error);
        throw new Error("Error uploading imageFile to S3");
    }
};

export const upload3dModel = async (gltfFile: Express.Multer.File): Promise<string> => {
    try {
        return await uploadModelToS3(gltfFile, s33dModelsBucketName);
    } catch (error) {
        console.error("Error uploading gltfFile to S3:", error);
        throw new Error("Error uploading gltfFile to S3");
    }
};

const uploadImageToS3 = async (file: Express.Multer.File, bucket: string, s3ImagesDomainUrl: string) => {
    const key = s3Helper.getSluggifiedKeyWithExtension(file);
    const params = {
        Bucket: bucket,
        Key: key, // Use the corrected key without appending the extension twice
        Body: file?.buffer,
        ACL: s3AclConfig
    } as PutObjectCommandInput;

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const fileUrl = `${s3ImagesDomainUrl}/${key}`;
    console.log(`File successfully uploaded to ${fileUrl}`);

    return fileUrl;
}

const uploadModelToS3 = async (file: Express.Multer.File, bucket: string) => {
    const key = s3Helper.getSluggifiedKeyWithExtension(file);
    const params = {
        Bucket: bucket,
        Key: key, // Use the corrected key without appending the extension twice
        Body: file?.buffer,
        ACL: s3AclConfig
    } as PutObjectCommandInput;

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const fileUrl = `https://${bucket}.s3.${s3Region}.amazonaws.com/${key}`;
    console.log(`File successfully uploaded to ${fileUrl}`);

    return fileUrl;
}
