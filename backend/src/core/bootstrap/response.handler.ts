import type { NextFunction, Request, Response } from "express";

export const responseHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.sendResponse = function (
        { message = "Request successful", statusCode, success, responseData = undefined },
    ) {
        const isSuccess = success ?? (statusCode >= 200 && statusCode < 300);
        // Match your errorHandler response shape
        return res.status(statusCode).json({
            statusCode: statusCode,
            success: isSuccess,
            message,
            responseData,
        });
    };



    next();
};