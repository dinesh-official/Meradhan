/* eslint-disable @typescript-eslint/no-explicit-any */
export type CKYCEnvironment = "TEST" | "LIVE";

export interface CKYCConfig {
  fiCode: string;
  env: CKYCEnvironment;
  cersaiPublicKeyPem: string;
  fiPrivateKeyPem: string;
}

export interface CKYCResponse {
  raw: any;
  decryptedPID: any;
}

export class CKYCError extends Error {
  constructor(message: string, public code?: string, public response?: any) {
    super(message);
    this.name = "CKYCError";
  }
}
