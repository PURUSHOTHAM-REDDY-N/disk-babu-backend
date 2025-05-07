import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import path = require("path");

type FileNameCallback = (error: Error | null, filename: string) => void;

export const imageMulterConfig = {
  storage: multer.memoryStorage(),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      return cb(null, true); // Allow the file to be uploaded
    }
    cb(new Error("Unsupported image file type. Supported types: jpeg, png, jpg")); // Reject the file
  },
};

export const gltfMulterConfig = {
  storage: multer.memoryStorage(),
  fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
  ) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (fileExtension === '.gltf' || fileExtension === '.glb'){
      return cb(null, true); // Allow the file to be uploaded
    }
    cb(new Error("Unsupported file type. Supported types: gltf")); // Reject the file
  },
};

const imageUpload = multer(imageMulterConfig).single('image');

const gltfUpload = multer(gltfMulterConfig).single('file');

export const validateGltf = async (req: Request, res: Response, next: NextFunction) => {
  gltfUpload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Custom errors (e.g. file size, unsupported type)
      return res.status(400).json({ message: err.message });
    }
    // If no errors, proceed to the next middleware or controller
    next();
  });
}

export const validateImage = async (req: Request, res: Response, next: NextFunction) => {
  imageUpload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Custom errors (e.g. file size, unsupported type)
      return res.status(400).json({ message: err.message });
    }
    // If no errors, proceed to the next middleware or controller
    next();
  });
}


