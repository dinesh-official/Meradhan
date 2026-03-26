import type { HttpStatus } from "@utils/error/AppError";

// types/express/index.d.ts
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      cookies?: { [key: string]: string };
      session?: {
        id: number;
        email: string;
        token: string;
        role: "ADMIN" | "SUPER_ADMIN" | "VIEWER" | "SALES" | "SUPPORT" | "RELATIONSHIP_MANAGER";
      };
      customer?: {
        id: number;
        email: string;
        token: string;
        role: "USER";
        meradhan_tracking_session?: string;
      };
    }
    interface Response {
      sendResponse: (d: {
        statusCode: HttpStatus;
        success?: boolean;
        message?: string;
        responseData?: unknown;
      }) => Response;
    }
  }
}
export {}; // 👈 very important so TS treats this as a module
