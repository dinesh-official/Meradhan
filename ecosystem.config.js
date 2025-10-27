module.exports = {
    apps: [
        // 🚀 Backend API
        {
            name: "MeraDhan-Backend",
            cwd: "./backend",
            script: "npm",
            args: "run start",
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
            cwd: "./backend",
            script: "npm",
            args: "run worker",
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
            name: "MeraDhan-CRM",
            cwd: "./frontend/crm",
            script: "npm",
            args: "run start",
            autorestart: true,
            restart_delay: 5000,
            env: {
                NODE_ENV: "production"
            }
        },

        // frontend
        {
            name: "MeraDhan-Client",
            cwd: "./frontend/meradhan",
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
