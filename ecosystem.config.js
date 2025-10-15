module.exports = {
    apps: [
        // 🚀 Backend API
        {
            name: "MeraDhan-Backend",
            cwd: "./backend",                // path to backend folder
            script: "npm",
            args: "run start",               // or whatever your backend start script is
            autorestart: true,
            watch: false,
            max_restarts: 10,
            restart_delay: 5000,
            env: {
                NODE_ENV: "production"
            }
        },

        // ⚙️ Worker Process
        {
            name: "MeraDhan-Worker",
            cwd: "./backend",                 // path to worker folder
            script: "npm",
            args: "run pmw2:worker",        // or "start" depending on your package.json
            autorestart: true,
            watch: false,
            max_restarts: 10,
            restart_delay: 5000,
            env: {
                NODE_ENV: "production"
            }
        },

        // frontend
        {
            name: "MeraDhan-Notification",
            cwd: "./frontend/crm",
            script: "npm",
            args: "run start",
            autorestart: true,
            restart_delay: 5000,
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};
