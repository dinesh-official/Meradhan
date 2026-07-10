/** CBRICS `workflowStatus` (unreg participant) → `customerProfile.kraStatus` label. */
export const CBRICS_WORKFLOW_STATUS_TO_KRA: Record<string, string> = {
  "0": "CBRICS Pending with exchange",
  "1": "VERIFIED",
  "5": "CBRICS Rejected",
  "6": "CBRICS Returned",
  "10": "CBRICS Pending with exchange",
  "15": "CBRICS Rejected by checker",
  "16": "CBRICS Returned by checker",
  "100": "CBRICS Pending With Checker",
};

export const kraStatusFromCbricsWorkflowStatus = (
  workflowStatus: unknown,
): string =>
  CBRICS_WORKFLOW_STATUS_TO_KRA[String(workflowStatus ?? "")] ?? "PENDING";
