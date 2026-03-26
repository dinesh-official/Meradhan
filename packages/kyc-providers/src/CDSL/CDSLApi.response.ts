export interface BoPanRequest {
    boid: string;
    pan1: string;
    pan2?: string | null;
    pan3?: string | null;
}

export interface BoPanResponse {
    ReqSeqNo: string;
    statuscode: "00" | "01";
    TimeStamp: string;
    ErrorCode: string;
    ErrorDescription: string;
}
