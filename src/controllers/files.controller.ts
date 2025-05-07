import {NextFunction, Request, Response, Router} from "express";
import {imageMulterConfig, validateGltf, validateImage} from '../Middilewares/files.middleware';
import multer from "multer";
import * as s3Service from "../services/s3.service";
import * as authOptions from "../Middilewares/auth.middleware";


const imageUpload = multer(imageMulterConfig);

const router = Router();


/**
 * @swagger
 * /files/upload-image:
 *   post:
 *     summary: Upload an image to S3 bucket
 *     tags:
 *       - Files
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image successfully uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL of the uploaded image
 *       400:
 *         description: Unauthorized or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unsupported File Type"
 *       500:
 *         description: Internal server error
 */
router.post("/files/upload-image", authOptions.isAtLeastUser, validateImage, async (req:Request, res:Response, next:NextFunction) => {
    try {
        const uploadedUrl = await s3Service.uploadImage(req.file!)
        res.json({url: uploadedUrl});
    } catch (error) {
        next(error)
    }
})


/**
 * @swagger
 * /files/upload-gltf:
 *   post:
 *     summary: Upload a gltf file to S3 bucket
 *     tags:
 *       - Files
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Gltf file to upload
 *     responses:
 *       200:
 *         description: Gltf successfully uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL of the uploaded gltf file.
 *       400:
 *         description: Unauthorized or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unsupported File Type"
 *       500:
 *         description: Internal server error
 */
router.post("/files/upload-gltf", authOptions.isAtLeastAdmin, validateGltf, async (req:Request, res:Response, next:NextFunction) => {
    try {
        const uploadedUrl = await s3Service.upload3dModel(req.file!)
        res.json({url: uploadedUrl});
    } catch (error) {
        next(error)
    }
})


export default router;
