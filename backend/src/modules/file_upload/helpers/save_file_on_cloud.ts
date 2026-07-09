import { AppError } from "@utils/error/AppError";
import fs from "fs";
import path from "path";
import { putFileS3 } from "../s3_file_uploader";

interface StoreFileOptions {
  filePath: string;
  directory?: string;
  provider?: "S3" | "Local";
}

export async function saveFileOnCloud({
  filePath,
  directory,
  provider = "S3",
}: StoreFileOptions): Promise<string> {
  switch (provider) {
    case "S3": {
      const { location } = await putFileS3(filePath, directory);
      if (!location) throw new AppError("File upload failed.");
      return location;
    }

    case "Local": {
      /**
       * SECURITY WARNING: Local file storage should NEVER be used for sensitive files!
       * 
       * ⚠️  DO NOT use "Local" provider for:
       * - KYC documents (PAN, Aadhar, etc.)
       * - PII (Personally Identifiable Information)
       * - Financial documents
       * - Any sensitive user data
       * 
       * ✅ Use "S3" provider instead for all sensitive files.
       * 
       * The uploads/ directory is NOT publicly accessible in production,
       * but files stored here should still be considered less secure than S3.
       * Use this only for non-sensitive temporary files or development/testing.
       */
      console.log(filePath);

      // cria subpasta como Multer faria
      const destFolder = path.join("uploads", directory || "");

      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }

      const fileName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(filePath);

      const savedPath = path.join(destFolder, fileName);

      // copia o arquivo manualmente
      fs.copyFileSync(filePath, savedPath);

      // retorno no mesmo formato de uploadFile()
      // Note: Files stored locally must be accessed via /api/uploads/*path (authenticated route)
      // NOT via /uploads/* (static serving is disabled in production)
      return `/${savedPath}`;
    }

    default:
      throw new Error("Invalid file upload provider.");
  }
}
