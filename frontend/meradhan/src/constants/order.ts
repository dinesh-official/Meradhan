/**
 * Order list filters. `value` is sent as `status` query param except `ALL` and `NOT_COMPLETED`.
 * `NOT_COMPLETED` = checkout / payment never finished (special backend filter).
 */
export const statusOptions = [
  { title: "All orders", value: "ALL" },
  { title: "Not completed (checkout)", value: "NOT_COMPLETED" },
  { title: "Pending", value: "PENDING" },
  { title: "In progress", value: "IN_PROGRESS" },
  { title: "Applied", value: "APPLIED" },
  { title: "Settled", value: "SETTLED" },
  { title: "Rejected", value: "REJECTED" },
  { title: "Expired", value: "EXPIRED" },
  { title: "Cancelled", value: "CANCELLED" },
];

export const bondTypeOptions = [
  { title: "All Types", value: "ALL" },
  { title: "Primary", value: "PRIMARY" },
  { title: "Secondary", value: "SECONDARY" },
];
