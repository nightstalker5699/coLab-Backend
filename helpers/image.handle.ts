import multer from "multer";
import sharp from "sharp";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import r2Client from "../r2.config";

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

    await r2Client.send(command);
    return `${process.env.R2_BUCKET_PUBLIC_URL}${key}`;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};

export const fileRemover = async (fileUrl: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileUrl,
    });
    const response = await r2Client.send(command);

    return response;
  } catch (error) {
    console.log("Error deleting resource:", error);
  }
};
