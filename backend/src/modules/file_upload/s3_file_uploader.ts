import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getMimeType } from "@utils/generate/get_mime_type";
import { env } from "@packages/config/src/env"; // ✅ Import env
import fs from "fs";
import path from "path";

// ✅ Use environment variables instead of hardcoded values
const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID, // ✅ From env
    secretAccessKey: env.S3_SECRET_ACCESS_KEY, // ✅ From env
  },
  forcePathStyle: true,
});

export async function putFileS3(
  filePath: string,
  destinationBucket?: string,
  bucketName?: string,
  destinationKey?: string
) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = destinationKey || path.basename(filePath);
    const savePath = path.join(
      new Date().getFullYear().toString(),
      destinationBucket || "",
      `${new Date().getTime()}-${fileName}`
    );

    const command = new PutObjectCommand({
      Bucket: bucketName || env.S3_BUCKET_NAME, // ✅ From env
      Key: savePath,
      Body: fileBuffer,
      ContentType: getMimeType(fileName),
    });

    const response = await s3.send(command);

    return {
      success: true,
      key: fileName,
      location: `/${savePath}`,
      response,
    };
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return { success: false, error };
  }
}
