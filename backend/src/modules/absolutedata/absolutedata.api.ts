import axios, { type AxiosInstance, isAxiosError } from "axios";
import { env } from "@packages/config/src/env";
import {
    assertAbsoluteDataIsin,
    parseAbsoluteDataGetBondByIsinResponse,
    type AbsoluteDataGetBondByIsinResult,
} from "./absolutedata.types";

export type AbsoluteDataApiConfig = {
    apiKey: string;
    /** Base URL without trailing slash, e.g. `https://api.absolutedata.ai` */
    baseUrl?: string;
    timeoutMs?: number;
};

const DEFAULT_BASE_URL = "https://api.absolutedata.ai";

/**
 * HTTP client for Absolute Data bonds API.
 *
 * @see https://api.absolutedata.ai — `GET /v1/bonds/isin/{isin}`
 */
export class AbsoluteDataApi {
    private readonly client: AxiosInstance;

    constructor(config: AbsoluteDataApiConfig) {
        const baseURL = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
        this.client = axios.create({
            baseURL,
            timeout: config.timeoutMs ?? 30_000,
            headers: {
                "x-api-key": config.apiKey,
                Accept: "application/json",
            },
            /** Resolve 4xx so `{ error: ... }` bodies are parsed instead of thrown. */
            validateStatus: (status) => status >= 200 && status < 500,
        });
    }

    /**
     * Fetch bond metadata by ISIN.
     * On success returns typed `items` + `pagination`. On API error (e.g. not found) returns `{ ok: false, error }`.
     */
    async getBondByIsin(isin: string): Promise<AbsoluteDataGetBondByIsinResult> {
        const normalized = assertAbsoluteDataIsin(isin);
        try {
            const res = await this.client.get<unknown>(
                `/v1/bonds/isin/${encodeURIComponent(normalized)}`,
            );
            return parseAbsoluteDataGetBondByIsinResponse(res.data);
        } catch (err) {
            if (isAxiosError(err) && err.response?.data !== undefined) {
                return parseAbsoluteDataGetBondByIsinResponse(err.response.data);
            }
            throw err;
        }
    }
}

/**
 * Build client from `ABSOLUTE_DATA_API_KEY` / `ABSOLUTE_DATA_API_BASE_URL` env vars.
 * @throws if `ABSOLUTE_DATA_API_KEY` is missing
 */
export function absoluteDataApiFromEnv(): AbsoluteDataApi {
    const apiKey = env.ABSOLUTE_DATA_API_KEY;
    if (!apiKey) {
        throw new Error(
            "ABSOLUTE_DATA_API_KEY is not set; configure env or use `new AbsoluteDataApi({ apiKey })`",
        );
    }
    return new AbsoluteDataApi({
        apiKey,
        baseUrl: env.ABSOLUTE_DATA_API_BASE_URL,
    });
}
