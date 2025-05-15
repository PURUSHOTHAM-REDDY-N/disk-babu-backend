// src/controllers/video.controller.ts
import { File } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import moment from "moment";
import { isValidToken } from "../Middilewares/auth.middleware";
import * as videoService from "../services/file.service";

const router = Router();

router.post(
  "/file/createFile",
  isValidToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    // const todayIst = moment.tz(date, "Asia/Kolkata").utc().toDate();
    const todayStart = moment.utc().startOf("day").toISOString();
    const video = {
      title: body.title,
      description: body.description,
      fileUrl: body.fileUrl,
      fileType: body.fileType,
      thumbnailUrl: body.thumbnailUrl,
      originalOwner: body.user.id,
      fileSize: body.fileSize,
      uploadedDate: todayStart,
      totalViews: 0,
    } as Omit<File, "id" | "createdAt" | "updatedAt" | "status">;

    try {
      const file = await videoService.createVideo(video);
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
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.user.id;

    try {
      const file = await videoService.getFilesByUser(userId);
      res.json({ file });
    } catch (error: any) {
      console.log(error);
      res.status(400).send({ message: `${error.message}` });
    }
  }
);

export default router;
