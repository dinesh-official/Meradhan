# Daily Timesheet

| **Developer Name** | **Sourav** | **Project name** | **MeraDhan Client Side** | **Date** | **27-Jan-2026** |
|-------------------|------------|------------------|---------------------------|----------|-----------------|

| Start Time | End Time | Task | Task Description | Challenges |
|------------|----------|------|------------------|------------|
| 10:00 am | 11:00 am | KRA Worker Review | Verified 72-hour timeout behaviour for addKraWorkerJob; confirmed job stops after RUNNER key expiry. | None |
| 11:00 am | 12:00 pm | KRA Worker – Infinite Loop Check | Analysed reschedule paths (WAITING, REGISTER, MODIFY, catch); confirmed 72h guard prevents infinite loop. | None |
| 12:00 pm | 1:00 pm | KRA Worker – Full Scenario Review | Reviewed backend KRA worker + kyc-providers docs for missing scenarios; identified bugs and edge cases. | Docx/Xlsx in docs not readable as text. |
| 1:00 pm | 2:00 pm | Documentation – REVIEW_SCENARIOS.md | Created REVIEW_SCENARIOS.md with critical bugs (checkIsKraMatched inverted, rejection not setting REJECTED), missing scenarios, and recommendations. | — |
| 2:00 pm | 3:00 pm | Bug Fix – checkIsKraMatched | Fixed inverted logic in CheckKraStatus.ts: return true when all fields match (matchers.every(Boolean)) so CBRICS runs when KRA data matches KYC. | Logic was returning true on mismatch. |
| 3:00 pm | 4:00 pm | Bug Fix – Rejection Handling | Updated CheckKraStatus to return "REJECTED" when KRA says rejted/rejected; service now checks status === "REJECTED" and sets customer to REJECTED, stops reschedule. | isRejected was always false (checked wrong value). |
| 4:00 pm | 5:00 pm | KRA Status Mapping | Mapped KRA API status strings (KYC Registd, Validated, Underprocess, Onhold, Rejted, etc.) to internal statuses (AVAILABLE, WAITING, REJECTED). | — |
| 5:00 pm | 6:00 pm | Documentation – KRA_STATUS_MAP.md | Created KRA_STATUS_MAP.md with full status map, quick lookup table, and note on KYC Registd-incomplete edge case. | — |
| 6:00 pm | 7:00 pm | Verification & Lint | Verified both fixes; confirmed no linter errors in CheckKraStatus.ts and KraWorker.service.ts. | None |
| 7:00 pm | 8:00 pm | — | — | — |
| 8:00 pm | 9:00 pm | — | — | — |
| 9:00 pm | 10:00 pm | — | — | — |

---

## Summary

- **Tasks completed:** KRA worker review, infinite-loop check, full scenario review, two critical bug fixes (checkIsKraMatched, REJECTED handling), KRA status mapping, and documentation (REVIEW_SCENARIOS.md, KRA_STATUS_MAP.md).
- **Files modified:** `backend/src/jobs/kra_worker/CheckKraStatus.ts`, `backend/src/jobs/kra_worker/KraWorker.service.ts`
- **Files created:** `backend/src/jobs/kra_worker/REVIEW_SCENARIOS.md`, `backend/src/jobs/kra_worker/KRA_STATUS_MAP.md`
