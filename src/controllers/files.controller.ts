// src/controllers/video.controller.ts
import { File } from '@prisma/client';
import { json, NextFunction, Request, Response, Router } from 'express';
import * as videoService from '../services/file.service';
import { isAtLeastUser, isValidToken } from '../Middilewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       required:
 *         - title
 *         - videoUrl
 *         - originalOwner
 *       properties:
 *         id:
 *           type: string
 *           example: "video123"
 *           description: Unique identifier for the video
 *         title:
 *           type: string
 *           example: "My Video Title"
 *           description: Title of the video
 *         description:
 *           type: string
 *           example: "This is a sample video"
 *         videoUrl:
 *           type: string
 *           example: "https://cdn.com/video.mp4"
 *           description: URL to the video file
 *         thumbnailUrl:
 *           type: string
 *           example: "https://cdn.com/thumb.jpg"
 *         originalOwner:
 *           type: string
 *           example: "user123"
 *           description: ID of the original owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   responses:
 *     VideoResponse:
 *       type: object
 *       properties:
 *         video:
 *           $ref: '#/components/schemas/Video'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Video creation failed"
 *
 * /videos/create:
 *   post:
 *     summary: Create a new video
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       200:
 *         description: Video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post(
  "/file/create",isValidToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    console.log(`Request-Body: ${json(body)}. Type is ${typeof body}`);

    const requestVideo = {
      title: body.title,
      description: body.description,
      fileUrl: body.fileUrl,
      thumbnailUrl: body.thumbnailUrl,
      originalOwner: body.user.id,
    } as Omit<File, "id" | "createdAt" | "updatedAt">;

    try {
      const file = await videoService.createVideo(requestVideo);
      res.json({ file });
    } catch (error: any) {
      console.log(error);
      res.status(400).send({ message: `${error.message}` });
    }
  }
);

export default router;
