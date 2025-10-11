import { LokiLogsProvider } from "@lib/provider/monitoring/loki.provider";
const logger = LokiLogsProvider.getInstance();
export default logger;