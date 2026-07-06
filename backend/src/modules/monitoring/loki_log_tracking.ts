import { createLogger, format } from 'winston';
import LokiTransport from 'winston-loki';
import type { LogsMonitorServiceInterface } from './monitoring';

function serializeLogMeta(value: unknown): unknown {
    if (value instanceof Error) {
        const err = value as Error & {
            statusCode?: number;
            code?: string;
            meta?: unknown;
        };
        return {
            name: err.name,
            message: err.message,
            ...(err.code != null ? { code: err.code } : {}),
            ...(err.statusCode != null ? { statusCode: err.statusCode } : {}),
            ...(err.meta != null ? { meta: err.meta } : {}),
            ...(err.stack != null && !err.code?.startsWith("P")
                ? { stack: err.stack }
                : {}),
        };
    }
    return value;
}

export class LokiLogsProvider implements LogsMonitorServiceInterface {

    private static instance: LokiLogsProvider;
    private logger;

    private constructor() {
        this.logger = createLogger({
            format: format.combine(format.timestamp(), format.json()),
            transports: [
                new LokiTransport({
                    host: process.env.LOKI_URL || "http://34.47.136.227:3100", // Replace with your Loki server URL
                    labels: { job: process.env.LOKI_JOB_NAME || "Backend" },
                    json: true,
                })
            ]
        });
    }

    public static getInstance(): LokiLogsProvider {
        if (!LokiLogsProvider.instance) {
            LokiLogsProvider.instance = new LokiLogsProvider();
        }
        return LokiLogsProvider.instance;
    }

    public logInfo(message: string, ...meta: unknown[]): void {
        this.logger.info(message,meta);
        console.info(message)
    }

    public logError(message: string, ...meta: unknown[]): void {
        const serialized = meta.map(serializeLogMeta);
        this.logger.error(message, serialized);
        if (serialized.length === 0) {
            console.error(message);
        } else {
            console.error(message, ...serialized);
        }
    }
}