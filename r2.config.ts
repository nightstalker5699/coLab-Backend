import { S3Client } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_BUCKET_ACCESS_KEY || "",
    secretAccessKey: process.env.R2_BUCKET_ACCESS_SECRET || "",
  },
});

export default r2Client;
