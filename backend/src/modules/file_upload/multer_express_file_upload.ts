import fs from "fs";
import multer from "multer";
import path from "path";
import { promisify } from "util";
import type { IFileUploadProvider } from "./file_upload_interface";

export class FileUploadProvider implements IFileUploadProvider {
  public uploadL: multer.Multer;
  private unlinkAsync: (path: fs.PathLike) => Promise<void>;
  constructor(
    private uploadFolder: string,
    allowedFileTypes?: string[]
  ) {
    this.unlinkAsync = promisify(fs.unlink);

    // Ensure upload folder exists
    if (!fs.existsSync(this.uploadFolder)) {
      fs.mkdirSync(this.uploadFolder, { recursive: true });
    }
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const subfolder =
          new Date().toISOString().split("T")[0] +
          "/" +
          (req.session?.id || "files");

        const fullPath = path.join(this.uploadFolder, subfolder);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
      },
    });

    this.uploadL = multer({
      storage,
      fileFilter(req, file, callback) {
        if (allowedFileTypes) {
          const ext = path.extname(file.originalname).toLowerCase();
          if (!allowedFileTypes.includes(ext)) {
            return callback(new Error("File type not allowed"));
          }
        }
        callback(null, true);
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Save file to the uploads folder (already done by Multer)
    // Return the URL or path
    return `${file.destination.split(this.uploadFolder)[1]}/${file.filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract file path from URL
    const filePath = path.resolve(fileUrl);

    try {
      if (fs.existsSync(filePath)) {
        await this.unlinkAsync(filePath);
        console.log(`File deleted: ${filePath}`);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
      throw error;
    }
  }
}
