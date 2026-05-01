/**
 * Shapes live NSE GET /unreg/:id payloads into an /unreg/update body
 * (no nested CRM/DB ids, only fields the API expects).
 */
export function buildCbricsUnregUpdateBodyFromLive(
  live: Record<string, unknown>
): Record<string, unknown> {
  const narrowStatus = (s: unknown): "A" | "S" | "D" => {
    const v = String(s ?? "").toUpperCase();
    if (v === "S" || v === "D") return v;
    return "A";
  };

  const yn = (x: unknown): "Y" | "N" => (x === "Y" ? "Y" : "N");

  const bankAccountList = (
    Array.isArray(live.bankAccountList) ? live.bankAccountList : []
  ).map((raw) => {
    const b = raw as Record<string, unknown>;
    const body: Record<string, unknown> = {
      bankName: String(b.bankName ?? ""),
      bankIFSC: String(b.bankIFSC ?? ""),
      isDefault: yn(b.isDefault),
      status: narrowStatus(b.status),
    };
    if (b.bankAccountNo != null && String(b.bankAccountNo).trim() !== "") {
      body.bankAccountNo = String(b.bankAccountNo);
    }
    return body;
  });

  const dpAccountList = (
    Array.isArray(live.dpAccountList) ? live.dpAccountList : []
  ).map((raw) => {
    const d = raw as Record<string, unknown>;
    const dpType = d.dpType === "CDSL" ? "CDSL" : "NSDL";
    const body: Record<string, unknown> = {
      dpType,
      benId: String(d.benId ?? ""),
      isDefault: yn(d.isDefault),
      status: narrowStatus(d.status),
    };
    if (d.dpId != null && String(d.dpId).trim() !== "") {
      body.dpId = String(d.dpId);
    }
    return body;
  });

  return {
    firstName: String(live.firstName ?? ""),
    panNo: String(live.panNo ?? ""),
    custodian: live.custodian ?? null,
    contactPerson: String(live.contactPerson ?? ""),
    mobileList: Array.isArray(live.mobileList)
      ? (live.mobileList as unknown[]).map((x) => String(x ?? "")).filter(Boolean)
      : [],
    emailList: Array.isArray(live.emailList)
      ? (live.emailList as unknown[]).map((x) => String(x ?? "")).filter(Boolean)
      : [],
    telephone: live.telephone != null ? String(live.telephone) : "",
    fax: live.fax != null && String(live.fax).trim() !== "" ? String(live.fax) : undefined,
    address: String(live.address ?? ""),
    address2:
      live.address2 != null && String(live.address2).trim() !== ""
        ? String(live.address2)
        : undefined,
    address3:
      live.address3 != null && String(live.address3).trim() !== ""
        ? String(live.address3)
        : undefined,
    stateCode: String(live.stateCode ?? ""),
    regAddress: String(live.regAddress ?? ""),
    leiCode: live.leiCode ?? null,
    dobDoi: live.dobDoi != null ? String(live.dobDoi) : "",
    expiryDate: live.expiryDate ?? null,
    bankAccountList,
    dpAccountList,
  };
}
