import type { CustomerProfile } from "@root/apiGateway";

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value).trim();
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function fullName(row: CustomerProfile): string {
  return [row.firstName?.trim(), row.middleName?.trim(), row.lastName?.trim()]
    .filter(Boolean)
    .join(" ");
}

export function downloadCustomersCsv(customers: CustomerProfile[]): void {
  const headers = [
    "Full Name",
    "Email",
    "Mobile",
    "Username",
    "KYC Status",
    "Join Date",
    "Account Status",
    "KRA Status",
    "Current KYC Step",
  ];
  const rows = customers.map((row) => [
    escapeCsvCell(fullName(row)),
    escapeCsvCell(row.emailAddress),
    escapeCsvCell(row.phoneNo ?? ""),
    escapeCsvCell(row.userName ?? ""),
    escapeCsvCell(row.kycStatus ?? ""),
    escapeCsvCell(row.createdAt ?? ""),
    escapeCsvCell(row.utility?.accountStatus ?? ""),
    escapeCsvCell(row.kraStatus ?? ""),
    escapeCsvCell(row.currentKycStepName ?? ""),
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `customers-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
