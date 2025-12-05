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

    this.app.use(cors());
    this.app.use(morgan("common"));
    this.app.use(helmet());
    this.app.use("/uploads", express.static("uploads"));

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json(), express.text({ type: "*/*" }));
    this.app.use(cookieParser());
    this.app.use(responseHandler);

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

    // add monitoring  -
    if (this.monitoring?.serverMonitor) {
      this.app.all("/metrics", async (req, res) => {
        const metrics =
          await this.monitoring!.serverMonitor!.getCollectedMetrics();
        res.setHeader(
          "Content-Type",
          this.monitoring!.serverMonitor!.responseType
        );
        res.send(metrics);
      });
    }

    // init user routes and middlewares -
    if (this.middlewares.length != 0) this.app.use(this.middlewares);
    if (this.routes.length != 0) this.app.use(this.routes);

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
