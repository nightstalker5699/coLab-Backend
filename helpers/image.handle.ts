import multer from "multer";
import sharp from "sharp";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import r2Client from "../r2.config";
import { catchReqAsync } from "./catchAsync";

const imageSharp = async (buffer: any) => {
  return await sharp(buffer).resize(400, 400).jpeg({ quality: 90 }).toBuffer();
};

export const imageHandle = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});

export const fileuploader = async (file: any, key: string, path: string) => {
  try {
    let buffer = file.buffer;

    if (file.mimetype === "image/jpeg" && file.mimetype === "image/png") {
      buffer = await imageSharp(file.buffer);
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${path}/${key}`,
      Body: buffer,
      ContentType: file.mimetype,
    });

    return { client: r2Client, key: command.input.Key, command };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};

export const fileRemover = async (fileUrl: string, path: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${path}/${fileUrl}`,
    });
    const response = await r2Client.send(command);

    return response;
  } catch (error) {
    console.log("Error deleting resource:", error);
  }
};

export const imageToBody = catchReqAsync(async (req, res, next) => {
  if (req.file) {
    req.file.originalname = req.file.originalname.split(" ").join("-");
    req.body.photo = `${Date.now()}-${req.file.originalname}`;
  }
  next();
});
