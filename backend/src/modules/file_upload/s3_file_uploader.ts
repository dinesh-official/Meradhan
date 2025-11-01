import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getMimeType } from "@utils/generate/get_mime_type";
import fs from "fs";
import path from "path";

// --- Setup Supabase storage credentials ---
const s3 = new S3Client({
    region: "ap-south-1",
    endpoint: "https://jfhfryiyfqrytbtzsdtj.storage.supabase.co/storage/v1/s3",
    credentials: {
        accessKeyId: "110adbdbb26d85253f743ec22d4152eb",
        secretAccessKey:
            "44f8cdf0f394c66a402a94cbd7b907f75dc739531f7b780685b4a10edcea329f",
    },
    forcePathStyle: true, // Supabase requires this
});

/**
 * Upload a file to Supabase Storage (S3-compatible)
 * @param filePath - Local file path to upload
 * @param bucketName - Supabase storage bucket name
 * @param destinationKey - File name/path inside the bucket
 */
export async function putFileS3(
    filePath: string,
    destinationBucket?: string,
    bucketName?: string,
    destinationKey?: string
) {

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = destinationKey || path.basename(filePath);
        const savePath = path.join(new Date().getFullYear().toString(), (destinationBucket || ""), `${new Date().getTime()}-${fileName}`)
        const command = new PutObjectCommand({
            Bucket: bucketName || "documents",
            Key: savePath,
            Body: fileBuffer,
            ContentType: getMimeType(fileName),
        });

        const response = await s3.send(command);

        console.log("✅ File uploaded successfully:", fileName);
        return {
            success: true,
            key: fileName,
            location: `https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public/documents/${savePath}`,
            response,
        };
    } catch (error) {
        console.error("❌ Upload failed:", error);
        return { success: false, error };
    }
}