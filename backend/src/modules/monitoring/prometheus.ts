import prom, { prometheusContentType } from 'prom-client';
import type { ResponseTimeMonitorInterface, ServerMonitorInterface } from "./monitoring";

export class PrometheusMonitorProvider implements ServerMonitorInterface {
    public responseType: string = prometheusContentType;

    constructor() {
        // Initialize default metrics
        prom.collectDefaultMetrics({
            register: prom.register,
            prefix: "app_"
        });
    }

    public async getCollectedMetrics(): Promise<string> {
        return prom.register.metrics();
    }
}


export class PrometheusResponseTimeMonitor implements ResponseTimeMonitorInterface {

    private responseTimes: prom.Histogram<"method" | "url" | "status_code">;
    private totalReqCount: prom.Counter<string>

    constructor() {
            this.totalReqCount = new prom.Counter({
            help: "total request count",
            name: "total_req",
        })
        // Initialization if needed
        this.responseTimes = new prom.Histogram({
            name: 'http_response_time_seconds',
            help: 'HTTP response time in seconds',
            labelNames: ['method', 'url', "status_code"] as const,
            buckets: [
                0.005,  // 5ms - ultra fast (in-memory cache hits)
                0.01,   // 10ms
                0.025,  // 25ms
                0.05,   // 50ms
                0.1,    // 100ms - ideal fast API
                0.25,   // 250ms
                0.5,    // 500ms
                1,      // 1s
                2.5,    // 2.5s
                5,      // 5s
                10,     // 10s
                30,     // 30s - long-running requests (rare),
            ]
        });
    }

    public recordResponseTime(method: string, url: string, duration: number, statusCode: string): void {
        this.totalReqCount.inc();
        this.responseTimes.labels(method, url, statusCode).observe(duration);
    }
}
