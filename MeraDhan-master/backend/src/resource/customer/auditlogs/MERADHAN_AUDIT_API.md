# Meradhan Audit Log API Documentation

## Overview

Complete audit log implementation for Meradhan frontend with **optional userId** and **required session tracking**.

## Database Models

- `SessionLogsMeradhan` - Session tracking with userId (optional), sessionToken & trackingToken (required)
- `PageViewLogsMeradhan` - Page view tracking with userId (optional), sessionId (required)
- `LoginLogsMeradhan` - Login/logout events with userId (optional)

---

## API Endpoints

### 1. Page Tracking APIs

#### Start Page Tracking

```
POST /api/auditlogs/meradhan/page-tracking/start
```

**Request Body:**

```json
{
  "sessionId": "session_token_123", // REQUIRED
  "userId": 1, // OPTIONAL
  "pagePath": "/dashboard",
  "pageTitle": "Dashboard",
  "entryTime": "2025-11-18T10:00:00Z",
  "scrollDepth": 0,
  "interactions": 0,
  "referrer": "https://google.com"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Meradhan Page View Log Created",
  "success": true,
  "responseData": {
    "pageViewId": 123
  }
}
```

---

#### End Page Tracking

```
POST /api/auditlogs/meradhan/page-tracking/end/:pageId
```

**Request Body:**

```json
{
  "sessionId": "session_token_123", // REQUIRED
  "userId": 1, // OPTIONAL
  "pagePath": "/dashboard",
  "pageTitle": "Dashboard",
  "exitTime": "2025-11-18T10:05:00Z",
  "duration": 300, // seconds
  "scrollDepth": 85, // percentage
  "interactions": 12
}
```

---

#### Update Page Tracking

```
POST /api/auditlogs/meradhan/page-tracking/update/:pageId
```

**Request Body:** (Partial update)

```json
{
  "scrollDepth": 90,
  "interactions": 15
}
```

---

### 2. Login Logs API

#### Get Login Logs

```
GET /api/auditlogs/meradhan/login-logs
```

**Query Parameters:**

- `userId` (optional) - Filter by user ID
- `startDate` (optional) - Filter from date (ISO format)
- `endDate` (optional) - Filter to date (ISO format)
- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 20, max: 100) - Items per page

**Example:**

```
GET /api/auditlogs/meradhan/login-logs?userId=1&page=1&pageSize=20
GET /api/auditlogs/meradhan/login-logs?startDate=2025-11-01&endDate=2025-11-18
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Meradhan Login Logs Retrieved",
  "success": true,
  "responseData": {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "ipAddress": "192.168.1.1",
        "browserName": "Chrome",
        "deviceType": "desktop",
        "operatingSystem": "Windows",
        "sessionType": "login",
        "success": true,
        "createdAt": "2025-11-18T10:00:00Z"
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 3. Session Logs API

#### Get Session Logs

```
GET /api/auditlogs/meradhan/session-logs
```

**Query Parameters:**

- `userId` (optional) - Filter by user ID
- `sessionToken` (optional) - Filter by session token
- `trackingToken` (optional) - Filter by tracking token
- `startDate` (optional) - Filter from date
- `endDate` (optional) - Filter to date
- `page` (optional, default: 1)
- `pageSize` (optional, default: 20, max: 100)

**Example:**

```
GET /api/auditlogs/meradhan/session-logs?userId=1
GET /api/auditlogs/meradhan/session-logs?sessionToken=abc123
GET /api/auditlogs/meradhan/session-logs?trackingToken=track_xyz
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Meradhan Session Logs Retrieved",
  "success": true,
  "responseData": {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "sessionToken": "session_abc123",
        "trackingToken": "track_xyz",
        "ipAddress": "192.168.1.1",
        "browserName": "Chrome",
        "deviceType": "desktop",
        "operatingSystem": "Windows",
        "startTime": "2025-11-18T10:00:00Z",
        "endTime": "2025-11-18T11:00:00Z",
        "duration": 3600,
        "totalPages": 15,
        "endReason": "logout",
        "user": {
          "firstName": "John",
          "middleName": null,
          "lastName": "Doe"
        },
        "pageViews": [
          {
            "id": 1,
            "sessionId": "session_abc123",
            "pagePath": "/dashboard",
            "pageTitle": "Dashboard",
            "duration": 300,
            "scrollDepth": 85,
            "interactions": 12
          }
        ]
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "pageSize": 20,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## Helper Functions

### 1. Add Login Log (Server-side)

```typescript
import { addMeradhanLoginBasedAuditLog } from "@resource/customer/auditlogs/auditlog.repo";

// Example: Login event
await addMeradhanLoginBasedAuditLog(req, {
  userId: 1, // OPTIONAL - can be undefined for guest
  email: "user@example.com",
  sessionType: "login",
  success: true,
});

// Example: Logout event
await addMeradhanLoginBasedAuditLog(req, {
  userId: 1,
  email: "user@example.com",
  sessionType: "logout",
  success: true,
});
```

### 2. End Session (Server-side)

```typescript
import { endMeradhanSessionLog } from "@resource/customer/auditlogs/auditlog.repo";

await endMeradhanSessionLog(req, {
  sessionToken: "session_abc123", // REQUIRED
  trackingToken: "track_xyz", // REQUIRED
  userId: 1, // OPTIONAL
  endReason: "logout",
  duration: 3600, // OPTIONAL - total session duration in seconds
});
```

---

## Key Features

### ✅ Optional User ID

- All APIs support **optional userId** parameter
- Works for both authenticated and guest users
- Filter logs by userId or retrieve all logs

### ✅ Required Session

- **sessionId/sessionToken is required** for page tracking
- **trackingToken is required** for session management
- Ensures proper session tracking even without user authentication

### ✅ Automatic Calculations

- Automatically increments `totalPages` when new page view is created
- Automatically increments session `duration` when page view ends
- Tracks browser info, device type, OS, and IP address

### ✅ Pagination Support

- All GET endpoints support pagination
- Default: 20 items per page
- Maximum: 100 items per page
- Includes meta information (total, pages, hasNext, hasPrev)

---

## Usage Example (Frontend)

```typescript
// 1. Start tracking a page
const response = await fetch("/api/auditlogs/meradhan/page-tracking/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId: sessionToken, // REQUIRED
    userId: currentUser?.id, // OPTIONAL
    pagePath: window.location.pathname,
    pageTitle: document.title,
    entryTime: new Date().toISOString(),
    scrollDepth: 0,
    interactions: 0,
    referrer: document.referrer,
  }),
});

const { pageViewId } = await response.json();

// 2. Track user interactions
let scrollDepth = 0;
let interactions = 0;

window.addEventListener("scroll", () => {
  scrollDepth = Math.max(scrollDepth, calculateScrollDepth());
});

document.addEventListener("click", () => {
  interactions++;
});

// 3. End tracking when leaving page
window.addEventListener("beforeunload", async () => {
  await fetch(`/api/auditlogs/meradhan/page-tracking/end/${pageViewId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: sessionToken,
      exitTime: new Date().toISOString(),
      duration: Math.floor((Date.now() - entryTime) / 1000),
      scrollDepth,
      interactions,
    }),
  });
});
```

---

## Files Modified

1. **auditlog.repo.ts** - Added Meradhan repository methods
2. **auditlogs.service.ts** - Added Meradhan service methods
3. **auditlogs.controller.ts** - Added Meradhan controller methods
4. **auditlog.routes.ts** - Added Meradhan API routes

---

## Database Schema Reference

```prisma
model SessionLogsMeradhan {
  id              Int       @id @default(autoincrement())
  userId          Int?                              // OPTIONAL
  sessionToken    String                            // REQUIRED
  trackingToken   String                            // REQUIRED
  ipAddress       String?
  userAgent       String?
  browserName     String?
  deviceType      String?
  operatingSystem String?
  endReason       String?
  startTime       DateTime  @default(now())
  endTime         DateTime?
  duration        Int       @default(0)
  totalPages      Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("session_logs_meradhan")
}

model PageViewLogsMeradhan {
  id           Int       @id @default(autoincrement())
  userId       Int?                                  // OPTIONAL
  sessionId    String                                // REQUIRED
  pagePath     String
  pageTitle    String?
  entryTime    DateTime  @default(now())
  exitTime     DateTime?
  duration     Int       @default(0)
  scrollDepth  Int       @default(0)
  interactions Int       @default(0)
  referrer     String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("page_view_logs_meradhan")
}

model LoginLogsMeradhan {
  id              Int      @id @default(autoincrement())
  userId          Int?                               // OPTIONAL
  name            String?
  email           String
  ipAddress       String?
  userAgent       String?
  browserName     String?
  deviceType      String?
  operatingSystem String?
  sessionType     String   @default("login")
  success         Boolean
  createdAt       DateTime @default(now())

  @@map("login_logs_meradhan")
}
```
