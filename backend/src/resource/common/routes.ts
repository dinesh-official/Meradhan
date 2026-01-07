import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@packages/config/src/env";
import { Router } from "express";
import { CommonApiController } from "./controller";
import { Readable } from "stream";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

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

commonApiRoutes.all(
  "/files/*path",
  allowAccessMiddleware("ADMIN", "USER"),
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

export default commonApiRoutes;
