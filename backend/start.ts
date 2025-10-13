import os from 'os'
import cluster from 'cluster'
import logger from '@utils/logger/logger';
const numCPUs = os.availableParallelism();
if (cluster.isPrimary) {
    logger.logInfo(`Primary ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        logger.logInfo(`cluster ${worker.process.pid} died`);
    });
} else {
    import("./main");
    logger.logInfo(`cluster ${process.pid} started`);
}