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
  provider = "Local",
}: StoreFileOptions): Promise<string> {
  switch (provider) {
    case "S3": {
      const { location } = await putFileS3(filePath, directory);
      if (!location) throw new AppError("File upload failed.");
      return location;
    }

    case "Local": {
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
      return `/${savedPath}`;
    }

    default:
      throw new Error("Invalid file upload provider.");
  }
}
