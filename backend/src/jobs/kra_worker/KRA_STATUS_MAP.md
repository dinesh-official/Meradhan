# KRA Status Map

Maps KRA API status strings (APP_STATUS / APP_UPDT_STATUS) to internal worker status and action.

---

## Internal statuses (worker)

| Internal | Meaning | Worker action |
|----------|--------|----------------|
| **WAITING** | Pending / in progress | Reschedule job (check again later) |
| **AVAILABLE** | KYC validated/registered at KRA | Download report → match → CBRICS or Modify |
| **REGISTER** | Not found at KRA | Call Register API, then reschedule |
| **REJECTED** | KYC rejected at KRA | Set customer to REJECTED, stop (no reschedule) |
| **ERROR** | Error / invalid / modification rejected | Log, stop (no reschedule) |

---

## KRA status string → internal status

| KRA status (from API) | Internal status | Notes |
|------------------------|-----------------|--------|
| KYC Registd | AVAILABLE | Ready for download |
| KYC Validated | AVAILABLE | Ready for download |
| Underprocess | WAITING | Still processing |
| KYC Onhold | WAITING | On hold |
| CVLMF Registd | AVAILABLE | Registered at CVL MF |
| KYC Rejted | REJECTED | Rejected; customer set to REJECTED |
| underprocess-incomplete | WAITING | Under process + incomplete |
| Underprocess-incomplete | WAITING | Same |
| Onhold-incomplete | WAITING | On hold + incomplete |
| KYC Registd-incomplete | AVAILABLE | Contains "registd" → treated as available |
| KYC Registd-incomplete | AVAILABLE | Same |

---

## Quick lookup (unique values from your list)

```
KRA Status                    → Internal   → Action
─────────────────────────────────────────────────────────────
KYC Registd                   → AVAILABLE  → Download → CBRICS or Modify
KYC Validated                 → AVAILABLE  → Download → CBRICS or Modify
Underprocess                  → WAITING    → Reschedule (1 hr)
KYC Onhold                    → WAITING    → Reschedule
CVLMF Registd                 → AVAILABLE  → Download → CBRICS or Modify
KYC Rejted                    → REJECTED   → Set REJECTED, stop
underprocess-incomplete       → WAITING    → Reschedule
Underprocess-incomplete       → WAITING    → Reschedule
Onhold-incomplete             → WAITING    → Reschedule
KYC Registd-incomplete        → AVAILABLE  → Download → CBRICS or Modify
```

---

## Matching logic (CheckKraStatus.ts)

Status is **normalized** (lowercased, trimmed). Order of checks:

1. `validation pending with` → **WAITING**
2. Non-empty `ERROR` (and not validated/registd) → **ERROR**
3. `validated` + `rejted`/`rejected` (in APP_UPDT_STATUS) → **ERROR** or **AVAILABLE** (by lastTask)
4. `underprocess` + updt validated/rejted → **WAITING**
5. `underprocess` \| `onhold` \| `incomplete` (in status or updtStatus) → **WAITING**
6. `kyc validated` → **AVAILABLE**
7. `validated at` \| `registd` → **AVAILABLE**
8. `incomplete` → **WAITING**
9. `kyc registd` \| `kyc validated` \| ends with `registd` \| ` registd ` \| ` registd at` → **AVAILABLE**
10. `rejted` \| `rejected` → **REJECTED**
11. `not available` → **REGISTER** (or WAITING/ERROR by lastTask)
12. (default) → **WAITING**

---

## Edge case: KYC Registd-incomplete

Today **KYC Registd-incomplete** is mapped to **AVAILABLE** because the code checks `status?.includes("registd")` before the `incomplete` branch. So “incomplete” is ignored when “registd” is present.

If KRA intends “KYC Registd-incomplete” to mean “not yet complete” and you want to **reschedule** instead of downloading, the check order in `CheckKraStatus.ts` would need to treat `*-incomplete` as **WAITING** (e.g. check for `incomplete` earlier or add an explicit `registd-incomplete` → WAITING rule).
