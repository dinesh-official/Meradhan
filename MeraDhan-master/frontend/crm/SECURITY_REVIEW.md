# CRM Frontend Security Review

**Date:** 2025-01-27  
**Reviewer:** Security Audit  
**Scope:** `/frontend/crm` codebase

---

## Executive Summary

This security review identified **2 CRITICAL**, **3 HIGH**, and **4 MEDIUM** severity security issues in the CRM frontend application. The most critical issues involve hardcoded credentials, insecure cookie configuration, and sensitive data exposure through logging.

---

## 🔴 CRITICAL Severity Issues

### 1. Hardcoded Basic Authentication Credentials

**Location:** `src/middleware.ts:10-11`

```typescript
const BASIC_AUTH_HEADER =
  "Basic " + Buffer.from("admin:admin").toString("base64");
```

**Issue:**

- Hardcoded credentials (`admin:admin`) in source code
- Credentials are visible in version control
- Cannot be changed without code deployment

**Impact:**

- Anyone with code access knows the credentials
- If code is leaked, credentials are compromised
- No way to rotate credentials without redeployment

**Recommendation:**

```typescript
const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || "";
const BASIC_AUTH_PASS = process.env.BASIC_AUTH_PASS || "";
const BASIC_AUTH_HEADER =
  "Basic " +
  Buffer.from(`${BASIC_AUTH_USER}:${BASIC_AUTH_PASS}`).toString("base64");
```

**Priority:** Fix immediately

---

### 2. Hardcoded Localhost API URL

**Location:** `src/middleware.ts:20`

```typescript
const apiUrl = "http://localhost:4000";
```

**Issue:**

- Hardcoded localhost URL breaks in production
- Should use environment variable
- Inconsistent with other API configurations

**Impact:**

- Production deployments will fail
- Cannot configure different environments
- Security risk if wrong environment is used

**Recommendation:**

```typescript
const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_HOST_URL || "http://localhost:4000";
```

**Priority:** Fix immediately

---

## 🟠 HIGH Severity Issues

### 3. Sensitive Token Logged to Console

**Location:** `src/middleware.ts:66`

```typescript
console.log({ token });
```

**Issue:**

- Authentication tokens are logged to console
- Tokens can be exposed in browser console, server logs, or error tracking services
- Violates security best practices

**Impact:**

- Token theft if logs are compromised
- Session hijacking attacks
- Compliance violations (GDPR, PCI-DSS)

**Recommendation:**

```typescript
// Remove console.log or use secure logging
if (process.env.NODE_ENV === "development") {
  console.log("Token present:", !!token); // Only log presence, not value
}
```

**Priority:** Fix before production

---

### 4. Insecure Cookie Configuration

**Location:** `src/app/api/verify/route.ts:16-19` and `src/core/config/cookies.config.ts`

**Issue:**

- Cookies missing `httpOnly` flag (accessible via JavaScript)
- Cookies missing `secure` flag (sent over HTTP)
- Cookies missing `sameSite` protection
- Token cookie is accessible to client-side JavaScript (XSS risk)

**Current Code:**

```typescript
const cookieOptions = {
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
```

**Impact:**

- XSS attacks can steal authentication tokens
- Man-in-the-middle attacks can intercept cookies
- CSRF attacks possible without sameSite

**Recommendation:**

```typescript
const cookieOptions = {
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  httpOnly: true, // Prevent JavaScript access
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict" as const, // CSRF protection
};
```

**Note:** Next.js `cookies()` API may not support all flags. Consider using `cookies().set()` with proper options or a cookie library.

**Priority:** Fix before production

---

### 5. Overly Permissive Image Configuration

**Location:** `next.config.ts:15-24`

```typescript
images: {
  unoptimized: true,
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**", // ⚠️ Allows ALL HTTPS hosts
    },
    {
      protocol: "http",
      hostname: "**", // ⚠️ Allows ALL HTTP hosts
    },
  ],
},
```

**Issue:**

- Allows images from any domain (including malicious ones)
- No domain whitelist
- HTTP protocol allowed (insecure)

**Impact:**

- SSRF (Server-Side Request Forgery) attacks
- Malicious image injection
- Data exfiltration through image requests

**Recommendation:**

```typescript
images: {
  unoptimized: true,
  remotePatterns: [
    {
      protocol: "https",
      hostname: "meradhan.co",
    },
    {
      protocol: "https",
      hostname: "www.meradhan.co",
    },
    {
      protocol: "https",
      hostname: "crm.meradhan.co",
    },
    // Add other trusted domains only
  ],
},
```

**Priority:** Fix before production

---

## 🟡 MEDIUM Severity Issues

### 6. Excessive Console Logging

**Location:** Multiple files (38 files found)

**Issue:**

- 38 files contain `console.log`, `console.error`, or `console.warn`
- Sensitive data may be logged
- Production code should not have debug logs

**Impact:**

- Information disclosure
- Performance impact
- Cluttered logs making security monitoring difficult

**Recommendation:**

- Remove or replace with proper logging library
- Use environment-based logging
- Never log sensitive data (tokens, passwords, PII)

**Files to Review:**

- `src/middleware.ts`
- `src/app/(presentation)/dashboard/leads/_components/manageLeads/form/hooks/useLeadFormDataHook.ts`
- `src/app/(presentation)/dashboard/user-management/_components/mangeuser/forms/hooks/useManageUserDataHook.ts`
- And 35+ more files

**Priority:** Clean up before production

---

### 7. ReactJson Component with Untrusted Data

**Location:** Multiple files using `react-json-view`

**Issue:**

- `ReactJson` component renders JSON data
- If data contains malicious scripts, could cause XSS
- Used in KYC logs, customer data views

**Example:**

```typescript
<ReactJson
  src={log.requestData || {}}
  theme="rjv-default"
  collapsed={1}
  enableClipboard={false}
  displayDataTypes={false}
/>
```

**Impact:**

- Potential XSS if JSON contains executable code
- Data exposure if sensitive information is rendered

**Recommendation:**

- Sanitize data before rendering
- Use `enableClipboard={false}` (already done ✅)
- Consider using a safer JSON viewer
- Validate data structure before rendering

**Priority:** Review and sanitize data sources

---

### 8. Missing Input Validation in API Route

**Location:** `src/app/api/verify/route.ts:9`

```typescript
const reqBody = await request.json();
```

**Issue:**

- No validation of request body before processing
- No size limits on request body
- Could allow DoS attacks with large payloads

**Impact:**

- DoS attacks with large payloads
- Type confusion attacks
- Unexpected behavior with malformed data

**Recommendation:**

```typescript
// Add validation
const MAX_BODY_SIZE = 1024; // 1KB
const contentLength = request.headers.get("content-length");
if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
  return NextResponse.json({ error: "Payload too large" }, { status: 413 });
}

const reqBody = await request.json();
// Validate with Zod schema
const validatedBody = verifyOtpSchema.parse(reqBody);
```

**Priority:** Add validation

---

### 9. dangerouslySetInnerHTML Usage

**Location:** `src/components/ui/chart.tsx:82-101`

**Issue:**

- Uses `dangerouslySetInnerHTML` for chart styles
- While the content appears safe (generated CSS), it's still a risk

**Current Code:**

```typescript
<style
  dangerouslySetInnerHTML={{
    __html: Object.entries(THEMES).map(/* CSS generation */).join("\n"),
  }}
/>
```

**Impact:**

- Potential XSS if THEMES data is compromised
- Risk if theme data comes from external source

**Recommendation:**

- Verify THEMES is from trusted source
- Consider using CSS-in-JS library instead
- If safe, document why it's acceptable

**Priority:** Review and document

---

## 🟢 LOW Severity / Best Practices

### 10. Missing Error Boundaries

**Issue:**

- No global error boundaries found
- Errors could expose sensitive information

**Recommendation:**

- Add error boundaries around major components
- Sanitize error messages in production

---

### 11. React Strict Mode Disabled

**Location:** `next.config.ts:8`

```typescript
reactStrictMode: false,
```

**Issue:**

- React Strict Mode helps identify potential problems
- Disabled for performance, but reduces safety

**Recommendation:**

- Enable in development
- Consider enabling in production for better error detection

---

### 12. Missing Content Security Policy (CSP)

**Issue:**

- No CSP headers configured
- Could help prevent XSS attacks

**Recommendation:**

- Add CSP headers via Next.js middleware or headers config
- Start with restrictive policy and adjust as needed

---

## ✅ Positive Security Practices Found

1. **Zod Schema Validation** - Forms use Zod for input validation ✅
2. **Authentication Middleware** - Routes are protected ✅
3. **Session Validation** - Session is validated on each request ✅
4. **Role-Based Access** - Role checking implemented ✅
5. **Environment Variables** - API URLs use environment variables ✅
6. **TypeScript** - Type safety helps prevent some vulnerabilities ✅

---

## Priority Action Items

### Immediate (Before Production):

1. ✅ Remove hardcoded Basic Auth credentials
2. ✅ Fix hardcoded localhost API URL
3. ✅ Remove token logging
4. ✅ Secure cookie configuration
5. ✅ Restrict image remotePatterns

### Short Term (Within 1 Week):

6. ✅ Clean up console.log statements
7. ✅ Add input validation to API routes
8. ✅ Review ReactJson usage for XSS risks

### Medium Term (Within 1 Month):

9. ✅ Add error boundaries
10. ✅ Implement Content Security Policy
11. ✅ Enable React Strict Mode in development
12. ✅ Set up proper logging infrastructure

---

## Testing Recommendations

1. **Security Testing:**

   - Run OWASP ZAP or similar security scanner
   - Test for XSS vulnerabilities
   - Test authentication bypass attempts
   - Test CSRF protection

2. **Penetration Testing:**

   - Hire external security firm
   - Test authentication flows
   - Test authorization boundaries

3. **Code Review:**
   - Review all API routes
   - Review all form submissions
   - Review all data rendering

---

## Compliance Considerations

- **GDPR:** Ensure PII is not logged or exposed
- **PCI-DSS:** If handling payment data, ensure proper security
- **SOC 2:** Document security controls

---

## Conclusion

The CRM frontend has a solid foundation with authentication, validation, and type safety. However, critical security issues need immediate attention before production deployment. The most urgent fixes are:

1. Hardcoded credentials
2. Insecure cookies
3. Token logging
4. Overly permissive image configuration

Once these are addressed, the application will be significantly more secure.

---

**Review Status:** ⚠️ **NOT PRODUCTION READY** - Critical issues must be fixed first.
