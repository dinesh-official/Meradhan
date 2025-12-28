import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl as presign } from "@aws-sdk/s3-request-presigner";
import type { StreamingBlobPayloadInputTypes } from "@smithy/types";

export interface S3Config {
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string; // optional
  forcePathStyle?: boolean; // for MinIO / DO Spaces
}

export class S3Storage {
  private client: S3Client;

  constructor(private readonly config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadFile(
    body: StreamingBlobPayloadInputTypes,
    key: string,
    contentType = "application/octet-stream"
  ) {
    return await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  }

  async getFile(key: string) {
    return await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      })
    );
  }

  async deleteFile(key: string) {
    return await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      })
    );
  }

  async generateSignedUrl(key: string, expiresInSeconds = 15 * 60) {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    const url = await presign(this.client, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      url,
      expiresInSeconds,
    };
  }

  async getFileStream(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });
    const response = await this.client.send(command);
    return response.Body;
  }
}

export default S3Storage;
