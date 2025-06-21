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

export const fileuploader = async (file: any, key: string) => {
  try {
    let buffer = file.buffer;

    if (file.mimetype === "image/jpeg" && file.mimetype === "image/png") {
      buffer = await imageSharp(file.buffer);
    }
    const Key = key.split("/");

    Key.shift();

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: Key.join("/"),
      Body: buffer,
      ContentType: file.mimetype,
    });

    const response = await r2Client.send(command);
    return response;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};

export const fileRemover = async (fileUrl: string) => {
  try {
    const url = fileUrl.split("/");
    url.shift();
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: url.join("/"),
    });
    const response = await r2Client.send(command);

    return response;
  } catch (error) {
    console.log("Error deleting resource:", error);
  }
};

export const imageToBody = (bodyLocation: string, location: string) =>
  catchReqAsync(async (req, res, next) => {
    if (req.file) {
      req.file.originalname = req.file.originalname.split(" ").join("-");
      req.body[bodyLocation] = `${
        process.env.R2_BUCKET_PUBLIC_URL
      }/${location}/${Date.now()}-${req.file.originalname}`;
    }
    next();
  });
