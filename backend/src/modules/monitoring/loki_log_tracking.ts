import { createLogger, format } from 'winston';
import LokiTransport from 'winston-loki';
import type { LogsMonitorServiceInterface } from './monitoring';


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
        this.logger.error(message,meta);
        console.error(message)
    }
}