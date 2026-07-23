import { describe, expect, test } from "bun:test";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import {
  extractSettleOrderFromPayload,
  mapSettleStatusToOrderStatus,
} from "./cbrics_settlement_webhook.service";

describe("extractSettleOrderFromPayload", () => {
  test("returns first settle row", () => {
    const payload = {
      settleOrderList: [
        { orderNumber: "26050600000072", settleStatus: 4 },
        { orderNumber: "999", settleStatus: 1 },
      ],
    };
    expect(extractSettleOrderFromPayload(payload)).toEqual({
      orderNumber: "26050600000072",
      settleStatus: 4,
    });
  });

  test("returns null when settleOrderList missing or empty", () => {
    expect(extractSettleOrderFromPayload({})).toBeNull();
    expect(extractSettleOrderFromPayload({ settleOrderList: [] })).toBeNull();
    expect(extractSettleOrderFromPayload(null)).toBeNull();
  });

  test("preserves string trade ids (no numeric coercion)", () => {
    const payload = {
      settleOrderList: [{ orderNumber: "26050600000072", settleStatus: "4" }],
    };
    const row = extractSettleOrderFromPayload(payload);
    expect(row?.orderNumber).toBe("26050600000072");
    expect(typeof row?.orderNumber).toBe("string");
  });
});

describe("mapSettleStatusToOrderStatus", () => {
  test("maps documented NSE settle statuses", () => {
    expect(mapSettleStatusToOrderStatus(0)).toBe(OrderStatus.IN_PROGRESS);
    expect(mapSettleStatusToOrderStatus(1)).toBe(OrderStatus.IN_PROGRESS);
    expect(mapSettleStatusToOrderStatus(3)).toBe(OrderStatus.IN_PROGRESS);
    expect(mapSettleStatusToOrderStatus(5)).toBe(OrderStatus.REJECTED);
    expect(mapSettleStatusToOrderStatus(6)).toBe(OrderStatus.EXPIRED);
    expect(mapSettleStatusToOrderStatus(8)).toBe(OrderStatus.CANCELLED);
  });

  test("settleStatus 4 is handled in processCbricsSettlementWebhook (SETTLED + deal sheet)", () => {
    expect(mapSettleStatusToOrderStatus(4)).toBeNull();
  });
});
