import os from 'os'
import cluster from 'cluster'
const numCPUs = os.availableParallelism();
if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    import("./main");
    console.log(`Worker ${process.pid} started`);
}