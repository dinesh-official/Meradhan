import { LokiLogsProvider } from "@modules/monitoring/loki_log_tracking";

const logger = LokiLogsProvider.getInstance();
export default logger;