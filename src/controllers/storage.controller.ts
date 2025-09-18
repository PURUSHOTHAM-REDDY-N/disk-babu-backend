import { NextFunction, Request, Response, Router } from "express";
import { isValidToken } from "../Middilewares/auth.middleware";
import * as storageService from "../services/storage.service";

const router = Router();

router.get(
  "/storage/getBucketByName",
  isValidToken,
  async (req: Request, res: Response) => {
    const bucketName = req.body.bucketName as string;
    if (!bucketName) {
      return res.status(400).send({ message: "Bucket name is required" });
    }

    try {
      const result = await storageService.getBukcetByName(bucketName);
      res.json(result);
    } catch (error: any) {
      console.error(error);
      res.status(400).send({ message: error.message });
    }
  }
);

router.post(
  "/storage/getPresignedUploadUrl",
  isValidToken,
  async (req: Request, res: Response) => {
    const filesName = req.body.fileName as string;
    if (!filesName) {
      return res.status(400).send({ message: "File name is required" });
    }
    const userId = req.body.user.id as string;
    try {
      const urls = await storageService.getPresignedUploadUrl(filesName, userId);
      res.json({ preSignedUrl: urls.preSignedUrl, storageKey: urls.storageKey });
    } catch (error: any) {
      console.error(error);
      res.status(400).send({ message: error.message });
    }
  }
);

router.post(
  "/storage/createAndSetBucketPolicies",
  isValidToken,
  async (req: Request, res: Response) => {
    const bucketName = req.body.bucketName as string;
    const corsRules = req.body.corsRules;
    if (!bucketName) {
      return res.status(400).send({ message: "bucketName is required" });
    }
    try {
      const createAndSetBucketCorsPolicy =
        await storageService.createAndSetBucketCorsPolicy(
          bucketName,
          corsRules
        );
      res.json({ createAndSetBucketCorsPolicy });
    } catch (error: any) {
      console.error(error);
      res.status(400).send({ message: error.message });
    }
  }
);

router.get(
  "/storage/getPresignedDownloadUrl",
  isValidToken,
  async (req: Request, res: Response) => {
    const filesName = req.body.fileName as string;
    const date = req.body.date as Date;
    if (!filesName || !date) {
      return res
        .status(400)
        .send({ message: "File name and date are required" });
    }

    try {
      const url = await storageService.getPresignedDownloadUrl(
        filesName,
        new Date(date)
      );
      res.json({ url });
    } catch (error: any) {
      console.error(error);
      res.status(400).send({ message: error.message });
    }
  }
);

export default router;
