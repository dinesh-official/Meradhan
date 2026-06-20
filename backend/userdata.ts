// src/s3-init.ts

import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand,
    ListBucketsCommand,
} from "@aws-sdk/client-s3";

const BUCKET_NAME =
    process.env.S3_BUCKET_NAME || "staging-meradhan-storage";

const s3 = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://localhost:4566",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "test",
    },
});

export async function ensureBucketExists() {
    try {
        await s3.send(
            new HeadBucketCommand({
                Bucket: BUCKET_NAME,
            })
        );

        console.log(`✅ Bucket exists: ${BUCKET_NAME}`);
    } catch (error: any) {
        if (
            error?.name === "NotFound" ||
            error?.$metadata?.httpStatusCode === 404
        ) {
            console.log(`📦 Creating bucket: ${BUCKET_NAME}`);

            await s3.send(
                new CreateBucketCommand({
                    Bucket: BUCKET_NAME,
                })
            );

            console.log(`✅ Bucket created: ${BUCKET_NAME}`);
        } else {
            throw error;
        }
    }
}

async function bootstrap() {
    await ensureBucketExists();

    const buckets = await s3.send(new ListBucketsCommand({}));

    console.log(
        "Buckets:",
        buckets.Buckets?.map((b) => b.Name)
    );
}

bootstrap().catch(console.error);