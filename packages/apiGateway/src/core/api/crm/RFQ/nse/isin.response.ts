import type { BaseResponseData, PaginationMeta } from "../../../../../types/base"

export type NseISINResponseData = BaseResponseData<{
    data: NSE_ISIN_DATA[], meta: PaginationMeta
}>

export type NSE_ISIN_DATA = {
    symbol: string
    description: string
    issuer: string
    maturityDate: string
    couponRate: number
    faceValue: number
    issueCategory: string
    listed: string
}
