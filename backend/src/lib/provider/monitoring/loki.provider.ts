import { createLogger, format } from 'winston';
import LokiTransport from 'winston-loki';
import type { LogsMonitorServiceInterface } from './monitoring.base';
import { config } from '@config/config';


export class LokiLogsProvider implements LogsMonitorServiceInterface {

    private static instance: LokiLogsProvider;
    private logger;

    private constructor() {
        this.logger = createLogger({
            format: format.combine(format.timestamp(), format.json()),
            transports: [
                new LokiTransport({
                    host: config.monitoring.lokiUrl, // Replace with your Loki server URL
                    labels: { job: config.monitoring.jobName },
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

    public logInfo(message: string): void {
        this.logger.info(message);
        console.info(message)
    }

    public logError(message: string): void {
        this.logger.error(message);
        console.error(message)
    }
}