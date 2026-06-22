/** CBRICS approval / workflow status codes (unreg participants, bank, DP accounts). */
export const CBRICS_APPROVAL_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "100", label: "Pending With Checker" },
  { value: "16", label: "Returned by Checker" },
  { value: "15", label: "Rejected by Checker" },
  { value: "0", label: "Pending With Exchange (0)" },
  { value: "10", label: "Pending With Exchange (10)" },
  { value: "1", label: "Approved" },
  { value: "5", label: "Rejected" },
  { value: "6", label: "Returned" },
] as const;

export const CBRICS_APPROVAL_STATUS_LABEL: Record<number, string> = {
  100: "Pending With Checker",
  16: "Returned by Checker",
  15: "Rejected by Checker",
  0: "Pending With Exchange",
  10: "Pending With Exchange",
  1: "Approved",
  5: "Rejected",
  6: "Returned",
};

/** Registered participant entity status from `POST /participant/find`. */
export const CBRICS_PARTICIPANT_ENTITY_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Inactive" },
  { value: "3", label: "Suspended" },
  { value: "4", label: "Unregistered" },
] as const;

export const CBRICS_PARTICIPANT_ENTITY_STATUS_LABEL: Record<number, string> = {
  1: "Active",
  2: "Inactive",
  3: "Suspended",
  4: "Unregistered",
};
