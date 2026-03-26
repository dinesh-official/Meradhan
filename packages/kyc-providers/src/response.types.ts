export interface DemateVerifyResponse<T> {
    idNo: string;
    fstHoldrPan: string;
    scndHoldrPan?: string;
    isVerified: boolean;
    thrdHoldrPan?: string;
    status: string;
    message?: string;
    error?: string;
    data?: T;
}