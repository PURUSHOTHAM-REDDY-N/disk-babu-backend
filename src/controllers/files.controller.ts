// src/controllers/video.controller.ts
import { File } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import moment from "moment";
import { isValidToken } from "../Middilewares/auth.middleware";
import * as fileService from "../services/file.service";

const router = Router();

router.post(
  "/file/createOriginalFile",
  isValidToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    // const todayIst = moment.tz(date, "Asia/Kolkata").utc().toDate();
    const todayStart = moment.utc().startOf("day").toISOString();
    const video = {
      fileName: body.fileName,
      description: body.description,
      fileType: body.fileType,
      thumbnailUrl: body.thumbnailUrl,
      originalOwner: body.user.id,
      currentOwner: body.user.id,
      fileSize: body.fileSize,
      fileExtension: body.fileExtension,
      storageProvider: body.storageProvider,
      storageKey: body.storageKey,
      uploadedDate: todayStart,
      totalViews: 0,
    } as Omit<File, "id" | "createdAt" | "updatedAt" | "status">;

    try {
      const file = await fileService.createFile(video);
      res.json({ file });
    } catch (error: any) {
      console.log(error);
      res.status(400).send({ message: `${error.message}` });
    }
  }
);

router.get(
  "/file/getFilesByUser",
  isValidToken,
  async (req: Request, res: Response) => {
    const userId = req.body.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    try {
      const result = await fileService.getFilesByUser(userId, page, pageSize);
      res.json(result);
    } catch (error: any) {
      console.error(error);
      res.status(400).send({ message: error.message });
    }
  }
);

export default router;
