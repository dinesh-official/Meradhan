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

// ==================== Meradhan Response Types ====================

export type T_LOGIN_LOGS_MERADHAN_RESPONSE = BaseResponseData<{
  data: Array<{
    id: number;
    userId?: number | null;
    name?: string | null;
    email: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    browserName?: string | null;
    deviceType?: string | null;
    operatingSystem?: string | null;
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

export type T_ACTIVITY_LOGS_MERADHAN_RESPONSE = BaseResponseData<{
  data: Array<{
    id: number;
    userId?: number | null;
    name?: string | null;
    email: string;
    entityType: string;
    action: string;
    entityId?: string | null;
    ipAddress?: string | null;
    details: object;
    userAgent?: string | null;
    browserName?: string | null;
    deviceType?: string | null;
    operatingSystem?: string | null;
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

export type T_SESSION_LOGS_MERADHAN_RESPONSE = BaseResponseData<{
  data: Array<{
    id: number;
    userId?: number | null;
    sessionToken: string;
    trackingToken: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    browserName?: string | null;
    deviceType?: string | null;
    operatingSystem?: string | null;
    endReason?: string | null;
    startTime: string;
    endTime?: string | null;
    duration: number;
    totalPages: number;
    createdAt: string;
    updatedAt: string;
    user?: {
      firstName: string;
      middleName?: string | null;
      lastName: string;
      email?: string | null;
    } | null;
    pageViews: Array<{
      id: number;
      sessionId: string;
      userId?: number | null;
      pagePath: string;
      pageTitle?: string | null;
      entryTime: string;
      exitTime?: string | null;
      duration: number;
      scrollDepth: number;
      interactions: number;
      referrer?: string | null;
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
