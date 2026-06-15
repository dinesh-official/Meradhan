# 24/7 Bond Trade Enablement — Design Spec

**Date:** 2026-06-15
**Status:** Approved (pending spec review)
**Area:** Backend (bond purchase / order settlement), minor frontend gate change

---

## 1. Goal

Let customers buy bonds **24/7, every day**, regardless of the NSE trading window. The "Buy Now" / "Proceed to Pay" flow is always available. Orders placed outside market hours are paid for and reserved immediately at the **price and yield locked in at purchase time**, and the trade is submitted to NSE CBRICS **at the next market open (9:15 AM IST) on the applicable working day**. Settlement remains **T+1** relative to the trade (deal) date.

## 2. Current behaviour (verified in code)

- **Stock decrement happens at payment-capture time**, inside the same DB transaction as `captureOrderPayment`, *before* the settlement job is queued — NOT after RFQ.
  - [order.service.ts:364-367](../../../backend/src/resource/customer/order/order.service.ts#L364-L367) → `applyPaidOrderInventoryDecrement` ([inventory_stock.service.ts:317](../../../backend/src/resource/crm/orders/inventory_stock.service.ts#L317)).
  - The NSE settlement flow ([order_settlement.service.ts](../../../backend/src/services/order/order_settlement.service.ts)) performs **zero** inventory operations.
  - **Conclusion:** the "reduce stock at payment" requirement is already satisfied — no change needed.
- **Pricing already shifts after-hours orders to the next working day.** `computeBondSettlement` ([order-pricing-helper.ts:144-210](../../../backend/src/services/order/order-pricing-helper.ts#L144-L210)) sets `dealDate` to the correct working day and `settlementDate = firstWorkingDayAfter(dealDate)`, computing accrued interest for that settlement date. The captured price is therefore already correct for next-working-day execution.
  - Branches: weekend/holiday → dealDate = `firstWorkingDayOnOrAfter`; before open (working day) → dealDate = today (T+0); during market → today (T+0); after close → `firstWorkingDayAfter` (next working day).
- **Market window constants** (UTC) and the **2026 holiday list** already live in [order-pricing-helper.ts:39-48](../../../backend/src/services/order/order-pricing-helper.ts#L39-L48). Working-day helpers `firstWorkingDayAfter` / `firstWorkingDayOnOrAfter` exist.
- **`allowTrade`** is `false` outside market hours; the frontend gates the buy button on it.
- **Settlement job** is queued with **no delay** on a **Bull** queue in [payment.controller.ts:140-150](../../../backend/src/resource/customer/payment/payment.controller.ts#L140-L150); worker is [order_settlement_worker.ts](../../../backend/src/jobs/order_settlement_worker.ts).
- **`settlementType: 1` (T+1)** hardcoded at [order_settlement.service.ts:594](../../../backend/src/services/order/order_settlement.service.ts#L594) — stays.
- **Order status** after payment is `APPLIED`; there is no "waiting for market" state.
- Two customer emails today, both gated on NSE flow (NOT payment): **Order Receipt** (after the 4 RFQ steps) and **Deal Sheet** (after NSE settles, webhook `settleStatus == 4`).

## 3. Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Hold mechanism until market open | **DB-backed scheduler/cron** — `scheduledExecutionAt` on the order is the source of truth; a cron each working day enqueues due orders. |
| Order status | **Keep user-facing `APPLIED`**; add nullable `scheduledExecutionAt` field to identify/queue scheduled orders. No new enum value. |
| Execution-time pricing | **Fire with the captured price/yield.** No re-pricing. Stock already decremented at payment, so no re-check needed at execution. |
| Failure at execution | **Reuse the existing NSE-rejection auto-refund flow** unchanged. |

## 4. Design

### 4.1 Market-open signal (backend authority)

Add a small helper in [order-pricing-helper.ts](../../../backend/src/services/order/order-pricing-helper.ts), reusing existing constants/holidays:

- `isMarketOpen(at: Date): boolean` — true iff `at` is a working day and within `[DEFAULT_TRADING_START, DEFAULT_TRADING_CUTOFF]` (UTC minutes).
- `nextMarketOpen(at: Date): Date` — the instant of the next 9:15 AM IST (03:45 UTC) on the applicable working day. Equivalent to: `dealDate` from `computeBondSettlement(at)` at 03:45 UTC. (Before-open working-day orders schedule for **today** 9:15; during-market orders never schedule; after-close/weekend/holiday schedule for the next working day.)

These derive from the same source of truth as pricing, so scheduling and the locked price stay consistent.

`allowTrade` returned to the frontend becomes effectively always-true for gating purposes (the button is always shown); the authoritative open/closed decision is made server-side at payment capture via `isMarketOpen`. We do not blanket-mutate the `allowTrade` field semantics elsewhere it is consumed — to be confirmed during planning by auditing all `allowTrade` consumers.

### 4.2 Schema change

Add to the `Order` model ([orders.prisma](../../../backend/databases/postgres/prisma/schema/orders.prisma)):

- `scheduledExecutionAt DateTime?` — when the trade should be submitted to NSE. `null` for immediately-executed (in-window) orders and for orders already enqueued/executed.

Prisma migration; nullable, so zero impact on existing rows.

### 4.3 Payment capture — immediate vs scheduled

In the webhook / `captureOrderPayment` path ([payment.controller.ts:119-150](../../../backend/src/resource/customer/payment/payment.controller.ts#L119-L150)):

```
on payment.captured:
  capture payment + decrement stock (UNCHANGED, existing transaction)
  if isMarketOpen(now):
      queue orderSettlementQueue job immediately   // existing behaviour
  else:
      set order.scheduledExecutionAt = nextMarketOpen(now)
      DO NOT queue the job now
      send "order received" email (mentions execution date)
```

The decision is made on the server clock, never trusting the client.

### 4.4 DB-backed scheduler (cron)

A new scheduled worker (following the existing job/cron conventions under [backend/src/jobs](../../../backend/src/jobs)) runs every working day around market open (and on a short interval thereafter to catch any that became due):

```
findDueScheduledOrders():
  orders where scheduledExecutionAt <= now
    AND scheduledExecutionAt IS NOT NULL
    AND status = APPLIED
    AND no settlement already initiated
for each due order:
  enqueue orderSettlementQueue job (same payload shape as payment.controller)
  clear scheduledExecutionAt (idempotency guard) in the same update
```

- **Idempotency:** clearing `scheduledExecutionAt` atomically (conditional `updateMany`) ensures an order is enqueued exactly once even if cron overlaps.
- From enqueue onward, the **existing settlement worker is reused unchanged** — RFQ (4 steps) → Order Receipt email → T+1 settlement → Deal Sheet. No duplication of NSE logic.
- **Failure** in the worker (NSE rejection / stock gone) flows through the **existing rejection + auto-refund path** unchanged.

### 4.5 New "order received" email (after-hours only)

Sent at payment capture for scheduled orders only, alongside the existing email infrastructure (CRM mailer used by the other order emails). Placeholder copy (final template to come from the manager):

> **Subject:** We've received your order — Order ID {orderNumber}
>
> Hi {customerName},
>
> Thank you for your purchase. We've received your payment and reserved **{quantity} unit(s) of {bondName}** (ISIN: {isin}) at the price and yield locked in at the time of your order.
>
> Because your order was placed outside market trading hours, it will be submitted to the exchange (NSE) on the next working day, **{executionDate — e.g. "Monday, 16 June 2026"}**, once the trading window opens at 9:15 AM. **The price and yield you saw at checkout are locked and will not change.**
>
> Once the trade is submitted you'll receive your Order Receipt, followed by the official Deal Sheet after the trade settles. No action is needed from you.
>
> Warm regards,
> Team MeraDhan

`{executionDate}` is `scheduledExecutionAt` formatted in IST.

### 4.6 Frontend

Remove the `allowTrade`-based gate so "Buy Now" / "Proceed to Pay" is always shown. No other frontend change (price/yield already captured server-side at checkout). Audit frontend consumers of `allowTrade` during planning.

## 5. Components & responsibilities

| Unit | Responsibility | Depends on |
|---|---|---|
| `isMarketOpen` / `nextMarketOpen` (pricing helper) | Authoritative market-open decision + next-open instant | existing constants/holidays |
| Schema: `Order.scheduledExecutionAt` | Source of truth for "waiting for market" | Prisma |
| Payment capture branch | Immediate-queue vs schedule + email | helpers, queue, mailer |
| Scheduler cron | Enqueue due orders idempotently | queue, DB |
| Settlement worker (existing) | RFQ → emails → settlement | unchanged |
| "Order received" email | Notify after-hours customers | existing mailer |
| Frontend gate removal | Always show buy button | — |

## 6. Edge cases

- **Before-open working-day order** → schedules for **today** 9:15, not next day (pricing already treats as T+0).
- **Weekend / holiday order** → schedules for next working day's 9:15.
- **Order placed at the exact open/close minute** → `isMarketOpen` boundary is inclusive of start and end (matches `isWithinTradingHoursUTC`).
- **Cron overlap / double-fire** → prevented by atomic clearing of `scheduledExecutionAt`.
- **Redis loss before cron runs** → DB `scheduledExecutionAt` survives; cron re-derives due orders (this is the reason for DB-backed scheduling over a Bull delay).
- **Execution failure next morning** → existing NSE-rejection auto-refund path.
- **Holiday list maintenance** → still the hardcoded 2026 list; out of scope to change, but flagged: must be kept current for correct next-working-day math.

## 7. Out of scope / non-goals

- No re-pricing or re-validation at execution time.
- No change to settlement type (stays T+1).
- No change to stock-decrement timing (already at payment).
- No change to the Order Receipt or Deal Sheet emails.
- Holiday-calendar automation (remains a hardcoded list).

## 8. Testing

- Unit: `isMarketOpen` / `nextMarketOpen` across all branches (before open, during, after close, weekend, holiday, boundaries) in IST.
- Unit: payment-capture branch selects immediate vs scheduled correctly for each time bucket.
- Unit: scheduler idempotency (no double enqueue under overlap).
- Integration: after-hours order → no immediate job, `scheduledExecutionAt` set, email sent; cron enqueues at/after due time; existing worker completes RFQ + emails.
- Regression: in-window order path unchanged (immediate queue, no schedule, no new email).
- Regression: NSE-rejection refund path still triggers for scheduled orders.
