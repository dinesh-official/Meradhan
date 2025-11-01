import { AppError } from "@utils/error/AppError";
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
            if (!location) {
                throw new AppError("File upload failed.");
            }
            return location;
        }
        case "Local":
            throw new AppError("Local file storage not implemented yet.");
        default:
            throw new Error("Invalid file upload provider.");
    }
}
