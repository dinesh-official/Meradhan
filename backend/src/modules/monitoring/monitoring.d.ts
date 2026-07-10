export interface ServerMonitorInterface {
    responseType: string;
    getCollectedMetrics(): Promise<string>;
}


interface ResponseTimeMonitorInterface {
    recordResponseTime(method: string, url: string, duration: number, statusCode: string, ip: string): void;
}


export interface LogsMonitorServiceInterface {
    logInfo(message: string): void;
    logError(message: string): void;
}
