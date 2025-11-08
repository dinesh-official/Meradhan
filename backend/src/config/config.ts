import argon2d from "argon2";

function getEnvVar(key: string, devDefault?: string): string {
    const value = process.env[key];
    if (value) return value;
    if ((process.env.MODE || "DEVELOPMENT") === "DEVELOPMENT" && devDefault !== undefined) return devDefault;
    throw new Error(`Missing required environment variable: ${key}`);
}

export const config = {
    hostUrl: getEnvVar("HOST_URL", "http://localhost:4000"),
    clientUrl: getEnvVar("HOST_URL", "http://localhost:3000"),
    storageUrl: getEnvVar("STORAGE_URL", "http://localhost:3000"),
    jwtSecret: getEnvVar("JWT_SECRET", "your_jwt_secret"),
    port: parseInt(getEnvVar("PORT", "4000")),
    mode: (process.env.MODE || "DEVELOPMENT") as "DEVELOPMENT" | "PRODUCTION",
    smtp: {
        host: getEnvVar("SMTP_HOST", "smtp.ethereal.email"),
        port: parseInt(getEnvVar("SMTP_PORT", "587")),
        sender: getEnvVar("SMTP_SENDER", `"Meradhan" <noreply@meradhan.co>`),
        user: getEnvVar("SMTP_USER", "maddison53@ethereal.email"),
        pass: getEnvVar("SMTP_PASS", "jn7jnAPss4f63QBp6D"),
        secure: getEnvVar("SMTP_PORT", "587") === '465' // true for 465, false for other ports
    },
    hashing: {
        argon2: {
            name: "argon2id",
            type: argon2d.argon2id,       // Use Argon2id variant
            memoryCost: 65536, // 64 MiB
            timeCost: 3,      // iterations
            parallelism: 1,
        }
    },
    monitoring: {
        jobName: "Backend",
        lokiUrl: "http://13.203.69.142:3100",
    },
    redis: {
        username: getEnvVar("REDIS_USERNAME", "default"),
        password: getEnvVar("REDIS_PASSWORD", "sourav"),
        host: getEnvVar("REDIS_HOST", "13.203.69.142"),
        port: parseInt(getEnvVar("REDIS_PORT", "6379"))
    }
};
