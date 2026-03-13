import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@packages/config/src/env";
import { Router } from "express";
import { CommonApiController } from "./controller";
import { Readable } from "stream";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import fs from "fs";
import path from "path";
import logger from "@utils/logger/logger";
import multer from "multer";

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const commonApiRoutes = Router();
const commonApiController = new CommonApiController();

commonApiRoutes.post("/api/contact/submit", (req, res) =>
  commonApiController.contactSubmit(req, res)
);

commonApiRoutes.post("/api/partnership/submit", (req, res) =>
  commonApiController.partnershipSubmit(req, res)
);

commonApiRoutes.post("/api/strapi/files/upload", (req, res) =>
  commonApiController.uploadStrapi(req, res)
);

/**
 * Proxy S3 file access
 * Example:
 * /files/2026/MDVZ0U0ON/kyc/1767688525623-selfie.jpeg
 */
commonApiRoutes.get("/files-public/*path", async (req, res) => {
  try {
    const token = req.query.token?.toString();
    if (token !== "meradhan24873284sadsrFAD") {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    const key = decodeURIComponent(
      (req.params as unknown as { path: string[] })["path"].join("/")
    );

    if (!key) {
      res.status(400).json({ message: "Missing file path" });
      return;
    }

    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });

    const s3Response = await s3.send(command);

    if (!s3Response.Body) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    res.setHeader(
      "Content-Type",
      s3Response.ContentType || "application/octet-stream"
    );
    if (s3Response.ContentLength) {
      res.setHeader("Content-Length", s3Response.ContentLength.toString());
    }
    if (s3Response.CacheControl) {
      res.setHeader("Cache-Control", s3Response.CacheControl);
    }
    if (s3Response.LastModified) {
      res.setHeader("Last-Modified", s3Response.LastModified.toUTCString());
    }

    res.setHeader("Content-Disposition", "inline");

    if (s3Response.Body instanceof Readable) {
      s3Response.Body.pipe(res);
    } else {
      const chunks: Uint8Array[] = [];
      for await (const chunk of s3Response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      res.send(Buffer.concat(chunks));
    }
  } catch (err) {
    console.error("S3 file fetch error:", err);
    const code =
      typeof err === "object" && err && "$metadata" in err
        ? (err as { $metadata?: { httpStatusCode?: number } }).$metadata
          ?.httpStatusCode
        : undefined;
    const name =
      typeof err === "object" && err && "name" in err
        ? (err as { name?: string }).name
        : undefined;

    const status = code === 404 || name === "NoSuchKey" ? 404 : 403;
    res.status(status).json({ message: "File access denied" });
  }
});

/**
 * SECURE: Authenticated file serving from S3
 * Requires authentication (USER or ADMIN role)
 * Example: GET /api/files/2026/MDVZ0U0ON/kyc/1767688525623-selfie.jpeg
 */
commonApiRoutes.all(
  "/files/*path",
  allowAccessMiddleware("CRM", "USER"),
  async (req, res) => {
    try {
      const key = decodeURIComponent(
        (req.params as unknown as { path: string[] })["path"].join("/")
      );

      if (!key) {
        res.status(400).json({ message: "Missing file path" });
        return;
      }
      // 2026/MDVZ0U0ON/kyc/1767688525623-selfie.jpeg

      const command = new GetObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
      });

      const s3Response = await s3.send(command);

      if (!s3Response.Body) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      res.setHeader(
        "Content-Type",
        s3Response.ContentType || "application/octet-stream"
      );
      if (s3Response.ContentLength) {
        res.setHeader("Content-Length", s3Response.ContentLength.toString());
      }
      if (s3Response.CacheControl) {
        res.setHeader("Cache-Control", s3Response.CacheControl);
      }
      if (s3Response.LastModified) {
        res.setHeader("Last-Modified", s3Response.LastModified.toUTCString());
      }

      res.setHeader("Content-Disposition", "inline");

      if (s3Response.Body instanceof Readable) {
        s3Response.Body.pipe(res);
      } else {
        const chunks: Uint8Array[] = [];
        for await (const chunk of s3Response.Body as AsyncIterable<Uint8Array>) {
          chunks.push(chunk);
        }
        res.send(Buffer.concat(chunks));
      }
    } catch (err) {
      console.error("S3 file fetch error:", err);
      const code =
        typeof err === "object" && err && "$metadata" in err
          ? (err as { $metadata?: { httpStatusCode?: number } }).$metadata
            ?.httpStatusCode
          : undefined;
      const name =
        typeof err === "object" && err && "name" in err
          ? (err as { name?: string }).name
          : undefined;

      const status = code === 404 || name === "NoSuchKey" ? 404 : 403;
      res.status(status).json({ message: "File access denied" });
    }
  }
);

/**
 * SECURE: Authenticated file serving from local uploads directory
 *
 * WARNING: This route should only be used for non-sensitive files.
 * Sensitive files (KYC/PII documents) should ALWAYS be stored in S3, not in uploads/.
 *
 * Requires authentication (USER or ADMIN role)
 * Example: GET /api/uploads/2024-01-01/files/1234567890-document.pdf
 */
commonApiRoutes.get(
  "/uploads/*path",
  allowAccessMiddleware("CRM", "USER"),
  async (req, res) => {
    try {
      const filePath = decodeURIComponent(
        (req.params as unknown as { path: string[] })["path"].join("/")
      );

      if (!filePath) {
        res.status(400).json({ message: "Missing file path" });
        return;
      }

      // Security: Prevent directory traversal attacks
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.includes("..") || normalizedPath.startsWith("/")) {
        logger.logError(`Blocked directory traversal attempt: ${filePath}`);
        res.status(403).json({ message: "Invalid file path" });
        return;
      }

      // Resolve the full file path within uploads directory
      const uploadsDir = path.join(process.cwd(), "uploads");
      const fullPath = path.join(uploadsDir, normalizedPath);

      // Ensure the file is within the uploads directory (prevent escaping)
      if (!fullPath.startsWith(path.resolve(uploadsDir))) {
        logger.logError(`Blocked path escape attempt: ${filePath}`);
        res.status(403).json({ message: "Invalid file path" });
        return;
      }

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      // Check if it's a file (not a directory)
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        res.status(403).json({ message: "Path is not a file" });
        return;
      }

      // Log file access for audit
      logger.logInfo(
        `File accessed via secure route: ${filePath} by user ${req.customer?.id || req.session?.id || "unknown"}`
      );

      // Determine content type
      const ext = path.extname(fullPath).toLowerCase();
      const contentTypes: Record<string, string> = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".txt": "text/plain",
        ".json": "application/json",
      };
      const contentType = contentTypes[ext] || "application/octet-stream";

      // Set headers
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", stats.size.toString());
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${path.basename(fullPath)}"`
      );

      // Stream the file
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);

      fileStream.on("error", (err) => {
        logger.logError(`Error streaming file ${filePath}:`, err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error reading file" });
        }
      });
    } catch (err) {
      logger.logError("Local file fetch error:", err);
      res.status(500).json({ message: "File access error" });
    }
  }
);

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});
commonApiRoutes.post("/api/files/upload", allowAccessMiddleware("ADMIN", "USER", "CRM"), uploadMemory.single("file"), (req, res) =>
  commonApiController.uploadFilesS3(req, res)
);

export default commonApiRoutes;
