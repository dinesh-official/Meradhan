# Audit Logs System – Analysis & Refactoring Strategy

## 1. Flow & logical issues

### 1.1 Missing / inconsistent event flows
- **Activity logs**: Created via `createCrmActivityLog()` from repo; no `status` or `level` (success/error/warning). Failed actions are not distinguished from successful ones.
- **Login logs**: `success` is stored; flow is consistent. `addCrmLoginBasedAuditLog` creates both a login log and an activity log (entityType "Auth") – good.
- **Session end**: `endAuditLogSession` updates session by `sessionToken` (from cookie); duration is incremented. No explicit “session expired” or timeout event type.
- **Gaps**: No audit event for “action failed” (e.g. API error). No `responseTime` or `statusCode` stored for activity logs.

### 1.2 Date filter bug (backend)
In `auditlogs.service.ts`, `getCrmLoginLogs`, `getCrmActivityLogs`, and `getSessionLogs` build:

```ts
where: { createdAt: { gte: startDate, lte: endDate } }
```

When `startDate` or `endDate` is `undefined`, Prisma still receives them and behaviour can be inconsistent. **Fix**: Only add `createdAt` (or `startTime`) to `where` when both dates are defined.

### 1.3 Redundant / N+1 queries

| Location | Issue | Impact |
|----------|--------|--------|
| `getCrmLoginLogs` | For each of N logs, 2× `findUnique(cRMUserDataModel)` for name and email | N+1; LoginLogsCrm already has `name` and `email` stored at write time | 
| `getSessionLogs` | For each of N sessions, 1× `findUnique(cRMUserDataModel)` for user | N+1; should batch user lookup |
| `getSessionLogs` | One `findMany(pageViewLogsCRM)` then `filter()` in JS per session | Acceptable but could group by `sessionId` once in a Map |

**Recommended**:
- Login: Return logs as-is (name/email already on model). Optionally one batch `findMany(cRMUserDataModel, { where: { id: { in: userIds } } })` if you want “current” user names.
- Session: Collect unique `userId` from sessions, single `findMany(cRMUserDataModel, { where: { id: { in: userIds } } })`, then map by id when building `data`.

---

## 2. Database & performance

### 2.1 Indexing
- **activity_logs_crm**: Queries filter by `createdAt`, often by `userId` and sometimes by `entityType`. No indexes found in schema.
- **login_logs_crm**: Filter by `createdAt`, `userId`. No indexes.
- **session_logs_crm**: Filter by `startTime`, `userId`. No indexes.
- **page_view_logs_crm**: Filter by `sessionId` (for session detail). No index.

**Suggested indexes** (add in Prisma):

```prisma
// ActivityLogsCRM
@@index([createdAt(sort: Desc)])
@@index([userId, createdAt(sort: Desc)])
@@index([entityType, createdAt(sort: Desc)])

// LoginLogsCrm
@@index([createdAt(sort: Desc)])
@@index([userId, createdAt(sort: Desc)])

// SessionLogsCRM
@@index([startTime(sort: Desc)])
@@index([userId, startTime(sort: Desc)])

// PageViewLogsCRM
@@index([sessionId])
@@index([sessionId, entryTime])
```

### 2.2 Inefficient filtering (frontend)
- **CrmActivityLogsVIew**: Fetches full page (e.g. 100 items), then applies **client-side** `filter()` for search (name, email, action, IP) and entity type. So backend always returns full page; filtering is in browser.
- **Impact**: With large result sets, user sees “filtered” count but backend still fetches by date/page only; search and entity filter are not applied in DB.

**Recommendation**: Add server-side query params: `search` (or `q`), `entityType`. Backend builds `where` with:
- `createdAt` range (if provided)
- `userId` (if provided)
- `entityType` (if provided)
- For `search`: Prisma `OR` on `name`, `email`, `action`, `ipAddress` (e.g. `contains`/`mode: 'insensitive'` for Postgres). Consider cursor/offset pagination and a cap on page size (e.g. 100).

---

## 3. Log structure & metadata

### 3.1 Current vs desired

| Field | Activity CRM | Login CRM | Desired |
|-------|--------------|-----------|---------|
| Timestamp | ✅ createdAt | ✅ createdAt | ✅ |
| User ID | ✅ userId | ✅ userId | ✅ |
| IP | ✅ ipAddress | ✅ ipAddress | ✅ |
| Action type | ✅ action | sessionType | ✅ |
| Response time | ❌ | ❌ | Add for API-triggered actions |
| Status / level | ❌ | ✅ success | Add status/level (success | error | warning) |
| statusCode | ❌ | ❌ | Optional for HTTP logs |

### 3.2 Schema additions (suggested)
- **ActivityLogsCRM** (and Meradhan if aligned):
  - `status` String? (e.g. "success" | "error" | "warning")
  - `responseTimeMs` Int? (milliseconds)
  - `statusCode` Int? (HTTP status if applicable)
- **Backfill**: Existing rows can stay `status: null`; new writes set status (and optionally responseTime/statusCode) from middleware or controller.

---

## 4. UI/UX improvements

### 4.1 Status indicators
- **Login logs**: Use existing `success` → green (success), red (failure). Already have data.
- **Activity logs**: Until `status` exists, infer from action (e.g. “delete”, “remove” → warning style; “create”, “add”, “update” → success style). After `status` is added, drive badge from it (success / error / warning).

### 4.2 Color coding
- **Entity type**: Already implemented (auth, customer, leads, rfq, users, login) with distinct badge colors.
- **Action**: Already implemented (create, update, delete, login, logout, etc.).
- **Level / status**: Add a small left border or icon (e.g. green | red | amber) per row from `status` or inferred rule.

### 4.3 Metadata display
- **Already shown**: Timestamp, User (name, email), IP, Entity, Action, Details (flattened), Device, OS.
- **To add** (when available): Response time (e.g. “124 ms”), Status (success/error/warning), optional statusCode in details or tooltip.

### 4.4 Scalability (high traffic)
- **Backend**: Indexes + server-side search/entity filter + bounded page size. Optionally: separate read replica for audit queries; archive old logs to cold storage and query only recent in main UI.
- **Frontend**: Keep pagination server-driven; avoid “load all”. Virtualize table if page size is large. Consider caching list responses with short TTL (e.g. 30–60 s) and invalidating on filter change.

---

## 5. Refactoring checklist

### Phase 1 – Backend (immediate)
- [ ] Fix date filter: only add `createdAt`/`startTime` to `where` when both start and end dates are defined.
- [ ] Remove N+1 in `getCrmLoginLogs`: return logs as-is (name/email already on model); remove per-log user fetch.
- [ ] Batch user lookup in `getSessionLogs`: single `findMany` by `id in [...userId]`, map when building response.
- [ ] Add optional query params `search`, `entityType` to activity (and login if needed) and implement server-side `where`.
- [ ] Add Prisma indexes for `activity_logs_crm`, `login_logs_crm`, `session_logs_crm`, `page_view_logs_crm` as above.

### Phase 2 – Schema & logging
- [ ] Add `status`, `responseTimeMs`, optional `statusCode` to ActivityLogsCRM (and Meradhan if desired).
- [ ] In `createCrmActivityLog` (and middleware), set `status` (and optionally responseTime/statusCode) from request/response.
- [ ] Ensure all critical flows (login, logout, key mutations) emit one consistent activity event with status.

### Phase 3 – Frontend
- [ ] Use server-side search and entity filter: pass `search`, `entityType` in API params; remove client-only filter for those; keep pagination from server.
- [ ] Add status indicator on activity rows (inferred from action until `status` exists).
- [ ] Add response time and status in Details or a new column when API returns them.
- [ ] Optional: table virtualization for large page sizes; short-lived cache for list queries.

### Phase 4 – Operations
- [ ] Retention/archival policy (e.g. move logs older than 90 days to archive table or object store).
- [ ] Read replica for audit read APIs if DB load is high.
- [ ] Alerts on error-rate or high response time for critical actions (using new status/responseTime fields).

---

## 6. Summary

- **Flow**: Add status/level and optional response time to activity logs; fix date filter and N+1 in login/session reads.
- **Performance**: Add indexes; server-side search and entity filter; batch user lookups.
- **Structure**: Store status, responseTimeMs, optional statusCode; keep consistent event semantics.
- **UI**: Status indicators and color coding; show response time and status when available; server-driven filtering and pagination for scalability.

This gives a clear path to a more consistent, performant, and scalable audit log system with better UX.
