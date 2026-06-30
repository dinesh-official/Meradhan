import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@packages/config/src/env";
import fs from "fs";
import path from "path";

type LogLevel = "debug" | "info" | "warn" | "error";

type LoggerOptions = {
    /**
     * Local directory for daily log files.
     * Default: `<backend>/log-files`
     */
    localDir?: string;
    /**
     * S3 key prefix (folder).
     * Default: `logs`
     */
    s3Prefix?: string;
    /**
     * If true, don't attempt S3 mirroring.
     * Default: false
     */
    disableS3?: boolean;
    /**
     * Maximum S3 object size we allow for "append" strategy.
     * When exceeded, we start a new file with suffix `-partN`.
     * Default: 5MB
     */
    maxS3ObjectBytes?: number;
    /**
     * Flush debounce window for S3 uploads.
     * Default: 2000ms
     */
    s3FlushDebounceMs?: number;
};

function pad2(n: number) {
    return n < 10 ? `0${n}` : String(n);
}

function ymdIst(d: Date): string {
    // Stable YYYY-MM-DD in Asia/Kolkata regardless of server tz.
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(d);
    const y = parts.find((p) => p.type === "year")?.value ?? "1970";
    const m = parts.find((p) => p.type === "month")?.value ?? "01";
    const day = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${y}-${m}-${day}`;
}

function isoTimestampIst(d: Date): string {
    // Human-friendly timestamp with IST offset label.
    const ymd = ymdIst(d);
    const t = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(d);
    return `${ymd} ${t} IST`;
}

function safeJson(v: unknown): string {
    if (v == null) return "";
    try {
        if (typeof v === "string") return v;
        return JSON.stringify(v);
    } catch {
        return String(v);
    }
}

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
    if (!body) return Buffer.from("");
    if (Buffer.isBuffer(body)) return Buffer.from(body);
    // AWS SDK v3 returns Readable in node; Bun supports async iterables here too.
    if (typeof body === "object" && Symbol.asyncIterator in (body as any)) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of body as AsyncIterable<Uint8Array>) chunks.push(chunk);
        return Buffer.from(Buffer.concat(chunks));
    }
    return Buffer.from(String(body));
}

function makeS3ClientOrNull(): S3Client | null {
    const region = env.S3_REGION;
    const endpoint = env.S3_ENDPOINT;
    const accessKeyId = env.S3_ACCESS_KEY_ID;
    const secretAccessKey = env.S3_SECRET_ACCESS_KEY;
    const bucket = env.S3_BUCKET_NAME;

    if (!region || !endpoint || !accessKeyId || !secretAccessKey || !bucket) return null;

    return new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
    });
}

class DailyS3Appender {
    private s3: S3Client | null;
    private bucket: string | null;
    private prefix: string;
    private maxBytes: number;
    private debounceMs: number;

    private pendingByKey = new Map<string, string>();
    private flushTimer: NodeJS.Timeout | null = null;
    private flushing = false;

    constructor(opts: { s3Prefix: string; maxBytes: number; debounceMs: number; disable: boolean }) {
        this.s3 = opts.disable ? null : makeS3ClientOrNull();
        this.bucket = env.S3_BUCKET_NAME ?? null;
        this.prefix = opts.s3Prefix.replace(/^\/+|\/+$/g, "") || "logs";
        this.maxBytes = opts.maxBytes;
        this.debounceMs = opts.debounceMs;
    }

    isEnabled() {
        return Boolean(this.s3 && this.bucket);
    }

    queueAppend(key: string, content: string) {
        if (!this.isEnabled()) return;
        const prev = this.pendingByKey.get(key) ?? "";
        this.pendingByKey.set(key, prev + content);
        this.scheduleFlush();
    }

    private scheduleFlush() {
        if (this.flushTimer) return;
        this.flushTimer = setTimeout(() => {
            this.flushTimer = null;
            void this.flush();
        }, this.debounceMs);
    }

    private async flush() {
        if (!this.isEnabled()) return;
        if (this.flushing) return;
        this.flushing = true;
        try {
            const entries = Array.from(this.pendingByKey.entries());
            this.pendingByKey.clear();

            for (const [key, delta] of entries) {
                await this.appendObject(key, delta);
            }
        } finally {
            this.flushing = false;
        }
    }

    private async appendObject(baseKey: string, delta: string) {
        if (!this.s3 || !this.bucket) return;

        // S3 has no real "append"; we do read → append → put (safe for small daily logs).
        // If the object grows too large, we roll to `-partN`.
        let part = 0;
        while (true) {
            const key = part === 0 ? baseKey : baseKey.replace(/\.txt$/, `-part${part}.txt`);
            const fullKey = `${this.prefix}/${key}`.replace(/\/+/g, "/");

            let existing: Buffer = Buffer.from("");
            try {
                const got = await this.s3.send(
                    new GetObjectCommand({ Bucket: this.bucket, Key: fullKey }),
                );
                existing = (await streamToBuffer(got.Body)) as Buffer;
            } catch (err) {
                const name =
                    typeof err === "object" && err && "name" in err ? (err as any).name : "";
                // OK if object doesn't exist yet.
                if (name && String(name).includes("NoSuchKey")) {
                    existing = Buffer.from("");
                } else {
                    // If we can't read, we still try to write delta as new object.
                    existing = Buffer.from("");
                }
            }

            const nextSize = existing.byteLength + Buffer.byteLength(delta, "utf8");
            if (nextSize > this.maxBytes) {
                part++;
                continue;
            }

            const body = Buffer.concat([existing, Buffer.from(delta, "utf8")]);
            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: fullKey,
                    Body: body,
                    ContentType: "text/plain; charset=utf-8",
                }),
            );
            return;
        }
    }
}

export class S3DailyLogger {
    private localDir: string;
    private s3Appender: DailyS3Appender;

    constructor(options: LoggerOptions = {}) {
        const localDir =
            options.localDir ??
            path.join(process.cwd(), "log-files");
        ensureDir(localDir);
        this.localDir = localDir;

        this.s3Appender = new DailyS3Appender({
            s3Prefix: options.s3Prefix ?? "logs",
            maxBytes: options.maxS3ObjectBytes ?? 5 * 1024 * 1024,
            debounceMs: options.s3FlushDebounceMs ?? 2000,
            disable: Boolean(options.disableS3),
        });
    }

    private fileNameForDate(d: Date) {
        return `log-${process.env.NODE_ENV || ""}-${ymdIst(d)}.txt`;
    }

    private formatLine(level: LogLevel, message: string, meta?: unknown) {
        const ts = isoTimestampIst(new Date());
        const metaStr = meta == null ? "" : ` ${safeJson(meta)}`;
        return `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
    }

    private appendLocal(line: string) {
        const name = this.fileNameForDate(new Date());
        const filePath = path.join(this.localDir, name);
        fs.appendFileSync(filePath, line, { encoding: "utf8" });
    }

    private appendS3(line: string) {
        if (!this.s3Appender.isEnabled()) return;
        const key = this.fileNameForDate(new Date());
        this.s3Appender.queueAppend(key, line);
    }

    log(level: LogLevel, message: string, meta?: unknown) {
        const line = this.formatLine(level, message, meta);
        this.appendLocal(line);
        this.appendS3(line);

        // Keep existing console behavior for runtime visibility.
        // eslint-disable-next-line no-console
        (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line.trimEnd());
    }

    info(message: string, meta?: unknown) {
        this.log("info", message, meta);
    }
    warn(message: string, meta?: unknown) {
        this.log("warn", message, meta);
    }
    error(message: string, meta?: unknown) {
        this.log("error", message, meta);
    }
    debug(message: string, meta?: unknown) {
        this.log("debug", message, meta);
    }
}

// LOCAL DEV: S3 log-mirroring disabled — no real S3 endpoint locally, and the
// fire-and-forget flush throws an unhandled ECONNREFUSED that crashes the process
// on boot. Local file logging (log-files/) is unaffected. Revert to `false` for
// environments with a reachable S3 endpoint.
const s3logger = new S3DailyLogger({ disableS3: true, s3Prefix: "logs" });
export default s3logger;

