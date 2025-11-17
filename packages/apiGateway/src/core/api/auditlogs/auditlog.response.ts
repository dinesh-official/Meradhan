import type { BaseResponseData } from "../../../types/base";

export type T_SESSION_LOGS_CRM_RESPONSE = BaseResponseData<{
  data: Array<{
    id: number;
    userId: number;
    sessionToken: string;
    ipAddress: string;
    userAgent: string;
    browserName: string;
    deviceType: string;
    operatingSystem: string;
    endReason?: string;
    startTime: string;
    endTime?: string;
    duration: number;
    totalPages: number;
    createdAt: string;
    updatedAt: string;
    user: {
      name: string;
      email: string;
    };
    pageViews: Array<{
      id: number;
      sessionId: string;
      userId: number;
      pagePath: string;
      pageTitle: string;
      entryTime: string;
      exitTime?: string;
      duration: number;
      scrollDepth: number;
      interactions: number;
      referrer: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}>;

export type T_ACTIVITY_LOGS_CRM_RESPONSE = BaseResponseData<{
  data: Array<{
    id: number;
    userId: number;
    name: string;
    email: string;
    entityType: string;
    action: string;
    entityId?: string;
    ipAddress: string;
    details: object;
    userAgent: string;
    browserName: string;
    deviceType: string;
    operatingSystem: string;
    url: string;
    createdAt: string;
    updatedAt: string;
  }>;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}>;

export type T_LOGIN_LOGS_CRM_RESPONSE = BaseResponseData<{
  data: Array<{
    id: number;
    userId: number;
    name: string;
    email: string;
    ipAddress: string;
    userAgent: string;
    browserName: string;
    deviceType: string;
    operatingSystem: string;
    sessionType: string;
    success: boolean;
    createdAt: string;
  }>;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}>;
