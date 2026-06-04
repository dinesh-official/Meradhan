# Yield Column in Order Receipt & Deal Sheet PDFs

**Date:** 2026-06-04  
**Status:** Approved

---

## Problem

The Order Receipt and Deal Sheet PDFs do not show the bond's indicative yield. It needs to appear as a row before "Principal Amount" in both documents.

## Scope

Two files only — no backend changes required:

| File | Row to insert before |
|------|----------------------|
| `packages/kyc-providers/pdf/Orders/OrdersPage.tsx` | `"Principal Amount"` at line 291 |
| `packages/kyc-providers/pdf/Orders/DealPage.tsx` | `"Principal Amount"` at line 258 |

Both files already receive the `bond` prop (`BondDetailsResponse`) which carries `buyYield` and `yield`.

## Change

Insert one entry in the `list` array immediately before `["Principal Amount", ...]` in each file:

```tsx
["Yield", `${Number(bond.buyYield ?? bond.yield ?? 0).toFixed(2)}%`],
```

- Source: `bond.buyYield` preferred, falls back to `bond.yield`, then `0`
- Format: two decimal places followed by `%` — consistent with "Coupon Rate" row
- No backend changes, no type changes, no metadata threading

## What is NOT changing

- `OrdersPageTwo.tsx` — page 2 of Order Receipt (bank/demat/settlement info, no pricing table)
- `DealPageTwo.tsx` — page 2 of Deal Sheet (same reason)
- Backend PDF service (`order-pdf.service.ts`, `orders.service.ts`)
- `pdf.ts` render functions
- Any frontend UI components
