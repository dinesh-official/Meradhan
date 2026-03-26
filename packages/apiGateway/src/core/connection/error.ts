import {AxiosError, type AxiosResponse, type InternalAxiosRequestConfig} from "axios";

export class ApiError<T, D> extends AxiosError<T, D> {
    constructor(
        message: string,
        code?: string,
        config?: InternalAxiosRequestConfig<D>,
        request?: unknown,
        response?: AxiosResponse<T, D>
    ) {
        super(message, code, config, request, response);
        this.name = "ApiError";

        // Fix prototype chain (important for `instanceof` checks to work)
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
