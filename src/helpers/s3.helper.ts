import getSlug from "speakingurl";
import path from "path";

export const mimeTypeToS3Type = (mimeType: string): string => {
    // Split the MIME type by "/" and return the second part (subtype)
    return mimeType.split('/')[1];
};

export const getSluggifiedKeyWithExtension = (imageFile: Express.Multer.File) => {

    const s3Type = mimeTypeToS3Type(imageFile.mimetype);
    const timestamp = Date.now();
    const fileSlugWithoutExtension = getSlug(path.basename(imageFile.originalname, path.extname(imageFile.originalname)));
    let key = `${timestamp}_${fileSlugWithoutExtension}`;
    const ext = path.extname(imageFile.originalname);
    if (!ext) {
        key = key + `.${s3Type}`;
    }else{
        key = key + ext;
    }

    return key
}
