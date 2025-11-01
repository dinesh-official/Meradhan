import os from 'os'
import cluster from 'cluster'
import logger from '@utils/logger/logger';
import { disconnectFromDatabases } from '@core/database/database';
import { cacheStorage } from './src/store/redis_store';
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


// Function to handle async shutdown
async function handleShutdown(signal?: string) {

    logger.logInfo(`Process ${signal || "exited"}: Server stopping...`);
    try {
        await disconnectFromDatabases();
        await cacheStorage.disconnect();
        logger.logInfo("Databases disconnected successfully.");
    } catch (err) {
        console.error("Error disconnecting databases:", err);
    }
    process.exit(0);
}

// Listen for signals for async cleanup
process.on("SIGINT", () => handleShutdown("SIGINT"));   // Ctrl+C
process.on("SIGTERM", () => handleShutdown("SIGTERM")); // Termination signal
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    handleShutdown("uncaughtException");
});

// Synchronous exit log (async not possible here)
process.on("exit", (code) => {
    logger.logInfo(`Process exited with code ${code}`);
});

