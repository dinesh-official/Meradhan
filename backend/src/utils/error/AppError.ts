// src/utils/errors/AppError.ts
export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
}


export class AppError extends Error {
    statusCode: number;
    code?: string;

    constructor(message: string, options: { statusCode?: HttpStatus; code?: string } = {}) {
        super(message.toString());
        this.statusCode = options.statusCode || 500;
        this.code = options.code;

        // 👇 fix prototype chain
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
