import type { BaseResponseData, PaginationMeta } from "../../../../types/base"



export type AuditLogDataResponse = BaseResponseData<{
    meta: PaginationMeta
    sessions: {
        trackId: string
        user: {
            id: number
            name: string
            email: string
            role: string
        }
        records: AuditLogData[]
    }[]
}>


export interface AuditLogData {
    id: number
    userId?: number
    type: string
    url?: string
    data?: Data
    createdAt: string
}

interface Data {
    os: string
    url: string
    role?: string
    query?: string
    title?: string
    ipData?: IpData
    screen?: Screen
    userId?: number
    browser?: string
    language?: string
    referrer?: string
    maxScrollPercent?: number
    clicks?: number
    duration?: number,
    reason?: string,
    user: {
        name?: string,
        email?: string,
        role?: string,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

interface IpData {
    ip: string
    asn: string
    org: string
    city: string
    in_eu: boolean
    postal: string
    region: string
    country: string
    network: string
    version: string
    currency: string
    latitude: number
    timezone: string
    languages: string
    longitude: number
    utc_offset: string
    country_tld: string
    region_code: string
    country_area: number
    country_code: string
    country_name: string
    currency_name: string
    continent_code: string
    country_capital: string
    country_code_iso3: string
    country_population: number
    country_calling_code: string
}

interface Screen {
    width: number
    height: number
}
