export interface DanRequest {
    transactionId: string;
    dpId: string;
    clientId: string;
    fstHoldrPan: string;
    scndHoldrPan?: string;
    thrdHoldrPan?: string;
}

export interface DanResponse {
    transactionId: string;
    rrn?: string;
    dpId: string;
    clientId: string;
    fstHoldrPan: string;
    scndHoldrPan?: string;
    thrdHoldrPan?: string;
    status: string;
    message?: string;
    error?: string;
}
