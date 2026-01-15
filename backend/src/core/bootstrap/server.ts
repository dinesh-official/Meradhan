import type { ServerMonitorInterface } from "@modules/monitoring/monitoring";
import { AppError, HttpStatus } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, type Router } from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import responseTime from "response-time";
import { errorHandler } from "./error_handler";
import { responseHandler } from "./response_handler";
import type { IExpressRoute, IServer } from "./server_interface";

type TMonitor = {
  serverMonitor?: ServerMonitorInterface;
  responseTimeHandler?: (data: {
    method: string;
    url: string;
    duration: number;
    statusCode: string;
  }) => void;
};

export class ExpressServer implements IServer, IExpressRoute {
  private app: Express;
  private server: http.Server;
  private port: number;
  private routes: Router[] = [];
  private middlewares: express.RequestHandler[] = [];
  private monitoring?: TMonitor;

  constructor(port: number, monitoring?: TMonitor) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = port;
    this.monitoring = monitoring;
  }

  // add user middlewares or routes -
  addMiddlewares(m: express.RequestHandler[]): void {
    this.middlewares.push(...m);
  }
  addRoutes(route: Router[]): void {
    this.routes.push(...route);
  }

  // start server function -
  start(cb?: () => void) {
    if (!this.port) {
      throw new AppError("Port not set. Call createApp(port) first.");
    }

    // Pre Middlewares -
    // Trust proxy - required for rate limiting and proper IP detection behind proxies
    this.app.set("trust proxy", 1);

    // CORS configuration - restrict to specific origins
    const isProduction = process.env.NODE_ENV === "production";
    const isDevelopment = !isProduction; // Treat anything not production as development

    const allowedOrigins = [
      "https://meradhan.co",
      "https://www.meradhan.co",
      "https://crm.meradhan.co",
      "https://api.meradhan.co", // Allow API subdomain
      "https://awscrm.meradhan.co",
      "https://aws.meradhan.co",
      "https://spyder.meradhan.co",
      "https://dev-crm.meradhan.co",
      "https://dev-api.meradhan.co",
      "https://dev.meradhan.co",
      ...(isDevelopment
        ? [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:4000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:4000",
          ]
        : []),
    ];

    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (same-origin requests, mobile apps, Postman, etc.)
          if (!origin) {
            // Allow same-origin requests (no origin header)
            return callback(null, true);
          }

          // Check if origin is in allowed list
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          // In development, be more permissive - allow localhost with any port
          const isDevelopmentHost =
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:");

          if (isDevelopmentHost && !isProduction) {
            return callback(null, true);
          }

          // Log blocked origin for security monitoring
          logger.logError(`CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Requested-With",
          "x-razorpay-signature", // For webhook
        ],
        exposedHeaders: ["Content-Range", "X-Content-Range"],
        maxAge: 86400, // 24 hours
      })
    );
    this.app.use(morgan("common"));
    this.app.use(helmet());
    
    // SECURITY: Do NOT serve /uploads statically - sensitive files (KYC/PII) may be stored there
    // Files should be served via:
    // 1. S3 with signed URLs (recommended for production)
    // 2. Authenticated API routes (see /api/files route)
    // Static serving removed to prevent unauthorized access to sensitive documents
    if (isDevelopment) {
      // In development only: serve uploads with a warning
      // This is for convenience during development but should never be used in production
      logger.logInfo(
        "⚠️  WARNING: /uploads is being served statically in development mode. " +
        "This is INSECURE and should never be enabled in production. " +
        "Sensitive files (KYC/PII) should only be stored in S3, not in uploads/."
      );
      this.app.use("/uploads", express.static("uploads"));
    } else {
      // Production: Block all access to /uploads via static serving
      this.app.use("/uploads", (req, res) => {
        logger.logError(`Blocked unauthorized access attempt to /uploads${req.path}`);
        res.status(403).json({
          status: false,
          code: "FORBIDDEN",
          message: "Direct access to uploads is not allowed. Use authenticated API routes or S3 signed URLs.",
        });
      });
    }
    
    this.app.use(express.urlencoded({ extended: true }));
    // SECURITY: Only parse JSON globally. Text parsing should be route-specific (e.g., webhook signature verification)
    // Routes that need raw body text (like payment webhooks) should use express.text() middleware on that specific route
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(responseHandler);
    
    // Public folder is safe - only contains non-sensitive static assets (images, etc.)
    this.app.use(express.static("public"));

    // add response time monitor -
    if (this.monitoring?.responseTimeHandler) {
      this.app.use(
        responseTime((req, res, time) => {
          this.monitoring?.responseTimeHandler?.({
            duration: time,
            method: req.method || "unknown",
            statusCode: res.statusCode.toString() || "unknown",
            url: req.url || "unknown",
          });
        })
      );
    }

    // init user routes and middlewares -
    if (this.middlewares.length != 0) this.app.use(this.middlewares);
    if (this.routes.length != 0) this.app.use(this.routes);

    this.app.all("/health", (req, res) => {
      res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Server is healthy",
      });
    });

    // handel 404 routes -
    this.app.all(/.*/, (req, res) => {
      res.sendResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: "api route not exist.",
      });
    });

    // handel error middleware -
    this.app.use(errorHandler);

    // start server  -
    this.server.listen(this.port, () => {
      logger.logInfo(
        `✅ Server is running in ${process.env.MODE || "DEVELOPMENT"} mode at http://localhost:${this.port}`
      );
      cb?.();
    });
  }
}
