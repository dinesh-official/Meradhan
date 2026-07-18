export {
  CRM_ORDER_STATUS_VALUES,
  ORDER_STATUS_CONFIG,
  getCrmOrderStatusDisplay,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  type CrmOrderStatus,
} from "@root/schema";

import {
  CRM_ORDER_STATUS_VALUES,
  ORDER_STATUS_CONFIG,
  getCrmOrderStatusDisplay,
  type CrmOrderStatus,
} from "@root/schema";

export const statusOptions = [
  { title: "All orders", value: "ALL" },
  ...CRM_ORDER_STATUS_VALUES.map((value) => ({
    title: ORDER_STATUS_CONFIG[value].title,
    value,
  })),
];

export const bondTypeOptions = [
  { title: "All Types", value: "ALL" },
  { title: "Primary", value: "PRIMARY" },
  { title: "Secondary", value: "SECONDARY" },
];

export function getOrderStatusBadgeClass(
  status: string,
  paymentStatus?: string | null,
  paymentProvider?: string | null,
): string {
  return getCrmOrderStatusDisplay(status, paymentStatus, paymentProvider)
    .badgeClass;
}

export function isCrmOrderStatus(status: string): status is CrmOrderStatus {
  return CRM_ORDER_STATUS_VALUES.includes(status.trim().toUpperCase() as CrmOrderStatus);
}
