"use client";

import { useCallback, useState } from "react";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { toast } from "sonner";

/** Response shape from POST /api/files/upload */
interface UploadResponse {
  success?: boolean;
  responseData?: { location: string; key: string };
  message?: string;
}

/**
 * Upload a file to S3 via POST /api/files/upload.
 * Use in manual-kyc to upload files instantly and get back the stored path.
 */
export function useUploadFileToS3() {
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File, directory = "kyc"): Promise<string | null> => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("directory", directory);

        const res = await apiClientCaller.post<UploadResponse>(
          "/files/upload",
          formData
        );

        const data = res.data;
        const location =
          data?.responseData?.location ?? (data as { location?: string })?.location;
        if (location) {
          return location;
        }
        toast.error("Upload failed: no location returned");
        return null;
      } catch (err) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? (err as Error)?.message ?? "Upload failed";
        toast.error(message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return { uploadFile, uploading };
}
