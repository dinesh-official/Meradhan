import { describe, it, expect, mock } from "bun:test";
import { DeridataApi } from "./deridata.api";

function makeApi(handler: (path: string, body: any) => { status: number; data: unknown }) {
  const api = new DeridataApi({
    merchantId: 101,
    secretKey: "your_secret_key",
    merchantName: "TestMerchant",
    merchantEmail: "test@mail.com",
    publicIp: "192.168.1.1",
  });
  // Replace the private axios client's post with a stub.
  (api as any).client = {
    post: mock(async (path: string, body: any) => {
      const { status, data } = handler(path, body);
      if (status >= 500) {
        const err: any = new Error("server");
        err.isAxiosError = true;
        err.response = { status, data };
        throw err;
      }
      return { status, data };
    }),
  };
  return api;
}

describe("DeridataApi", () => {
  it("getIssueDetail injects auth fields and returns ok:true", async () => {
    let seenBody: any;
    const api = makeApi((path, body) => {
      seenBody = body;
      expect(path).toBe("/api/public/merchant/v1/issue-detail/");
      return { status: 200, data: { isin: "INE2OTQ07077", coupon: "6.2626%" } };
    });
    const res = await api.getIssueDetail("ine2otq07077");
    expect(res.ok).toBe(true);
    expect(seenBody.merchant_id).toBe(101);
    expect(typeof seenBody.uuid).toBe("string");
    expect(typeof seenBody.checksum).toBe("string");
    expect(seenBody.isin).toBe("INE2OTQ07077");
  });

  it("maps a 403 to LIMIT_EXPIRED", async () => {
    const api = makeApi(() => ({ status: 403, data: { error: "Limit expired" } }));
    const res = await api.getEbp("INE2OTQ07077");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("LIMIT_EXPIRED");
  });

  it("maps a 404 to NOT_FOUND", async () => {
    const api = makeApi(() => ({ status: 404, data: { error: "No record found for ISIN" } }));
    const res = await api.getDocuments("INE2OTQ07077");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("NOT_FOUND");
  });

  it("maps a thrown 5xx (axios error with body) to SERVER_ERROR", async () => {
    const api = makeApi(() => ({ status: 500, data: { error: "An error occurred" } }));
    const res = await api.getSecurityCovenant("INE2OTQ07077");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("SERVER_ERROR");
  });

  it("calculate posts to the calculator path with the input merged", async () => {
    let seenBody: any;
    const api = makeApi((path, body) => {
      seenBody = body;
      expect(path).toBe("/api/public/merchant/v1/calculator/");
      return { status: 200, data: { summary: { clean_price: "98.5345" }, cashflows: [] } };
    });
    const res = await api.calculate({
      isin: "INE467V07966",
      value_date: "2026-04-16",
      amount: 100,
      yield_to_price: true,
      selected_yield: "ytm",
      ytm: 10,
      cashflow_shut_flag: false,
    });
    expect(res.ok).toBe(true);
    expect(seenBody.isin).toBe("INE467V07966");
    expect(seenBody.type_field).toBe("cashflow");
  });
});
