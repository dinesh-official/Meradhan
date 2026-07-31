import { env } from "@root/config/env";

/**
 * Complete column reference for customers_profile_data and kyc_dump.
 * All camelCase names MUST be double-quoted in the generated SQL.
 */
const SCHEMA_HINT = `
=== TABLE 1: customers_profile_data ===
Primary customer profile table.

Columns — double-quote every camelCase name:
  "id"               INTEGER      — primary key
  "userName"         TEXT         — unique login handle
  "firstName"        TEXT         — given name
  "middleName"       TEXT
  "lastName"         TEXT         — family name
  "gender"           TEXT         — 'MALE', 'FEMALE', 'OTHER', 'NA' (nullable)
  "legalEntityName"  TEXT         — nullable, corporate accounts
  "emailAddress"     TEXT         — unique email
  "phoneNo"          TEXT         — mobile number (nullable, unique)
  "whatsAppNo"       TEXT         — nullable
  "userType"         TEXT         — 'INDIVIDUAL', 'INDIVIDUAL_NRI_NRO', 'TRUST', 'CORPORATE', 'HUF', 'LLP', 'PARTNERSHIP_FIRM'
  "kycStatus"        TEXT         — coarse KYC verification status: 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'RE_KYC'
  "kraStatus"        TEXT         — default 'PENDING'
  "VerifiedBy"       INTEGER      — nullable
  "verifyDate"       TIMESTAMPTZ  — nullable
  "kycSubmitDate"    TIMESTAMPTZ  — nullable
  "useKraKyc"        BOOLEAN
  "isAFatcaCustomer" BOOLEAN
  "isAPep"           BOOLEAN
  "allowSEBITerms"   BOOLEAN
  "isDeleted"        BOOLEAN      — soft-delete; always filter WHERE cpd."isDeleted" = false
  "createdAt"        TIMESTAMPTZ
  "updatedAt"        TIMESTAMPTZ
  "createdBy"        INTEGER      — nullable

=== TABLE 2: kyc_dump ===
Stores the detailed KYC onboarding step for each customer (one row per customer).
Join key: kyc_dump."userID" = customers_profile_data."id"
NOTE: "userID" in kyc_dump is camelCase — double-quote it.

Columns:
  "userID"     INTEGER  — FK → customers_profile_data."id"
  "step"       INTEGER  — current KYC step (see mapping below)
  "updated_at" TIMESTAMPTZ — when the step was last updated (use for time-based KYC queries)

KYC step values (use the INTEGER in SQL, never the label string):
  0 = Not Started
  1 = Identity Validation
  2 = Personal Details
  3 = Bank Account
  4 = Demat Account
  5 = Risk Profiling
  6 = e-Signature
  7 = completed (KYC fully done)

CRITICAL — "Not started" has TWO database states:
  A. Row exists in kyc_dump with step = 0  (customer opened KYC but did nothing)
  B. NO row exists in kyc_dump at all      (customer never opened KYC)
  Both must be captured. Use LEFT JOIN + (kd."step" = 0 OR kd."userID" IS NULL).

When to use kyc_dump:
  - User asks about KYC not started / not done / not begun → LEFT JOIN kyc_dump, filter (kd."step" = 0 OR kd."userID" IS NULL)
  - User asks about a specific step 1–7 → JOIN kyc_dump (INNER), filter kd."step" = N
  - User asks about KYC verification status (verified, rejected, pending) → use "kycStatus" on customers_profile_data (no join needed)
  - User asks about KYC completion time → JOIN kyc_dump, filter kd."step" = 7 AND kd."updated_at"

=== JOIN PATTERNS ===
For steps 1–7 (row always exists) — use INNER JOIN:
  FROM customers_profile_data cpd
  JOIN kyc_dump kd ON kd."userID" = cpd."id"
  WHERE cpd."isDeleted" = false

For "not started" (step 0 OR no row) — use LEFT JOIN:
  FROM customers_profile_data cpd
  LEFT JOIN kyc_dump kd ON kd."userID" = cpd."id"
  WHERE cpd."isDeleted" = false AND (kd."step" = 0 OR kd."userID" IS NULL)

=== EXAMPLES ===
1. Customers who have NOT started KYC (step 0 or no kyc_dump row):
   SELECT cpd."id", cpd."firstName", cpd."lastName", cpd."emailAddress", cpd."phoneNo"
   FROM customers_profile_data cpd
   LEFT JOIN kyc_dump kd ON kd."userID" = cpd."id"
   WHERE cpd."isDeleted" = false AND (kd."step" = 0 OR kd."userID" IS NULL)
   LIMIT 500;

2. Customers at Bank Account step (step 3):
   SELECT cpd."id", cpd."firstName", cpd."lastName", cpd."emailAddress", cpd."phoneNo", kd."step"
   FROM customers_profile_data cpd
   JOIN kyc_dump kd ON kd."userID" = cpd."id"
   WHERE cpd."isDeleted" = false AND kd."step" = 3
   LIMIT 500;

3. Customers who completed KYC (step 7):
   SELECT cpd."id", cpd."firstName", cpd."lastName", cpd."emailAddress", cpd."phoneNo"
   FROM customers_profile_data cpd
   JOIN kyc_dump kd ON kd."userID" = cpd."id"
   WHERE cpd."isDeleted" = false AND kd."step" = 7
   LIMIT 500;

4. Customers who completed KYC in the last 7 days:
   SELECT cpd."id", cpd."firstName", cpd."lastName", cpd."emailAddress", cpd."phoneNo", kd."updated_at"
   FROM customers_profile_data cpd
   JOIN kyc_dump kd ON kd."userID" = cpd."id"
   WHERE cpd."isDeleted" = false AND kd."step" = 7 AND kd."updated_at" >= NOW() - INTERVAL '7 days'
   LIMIT 500;

5. Customers whose firstName starts with 'N' (no KYC join needed):
   SELECT "id", "firstName", "lastName", "emailAddress", "phoneNo"
   FROM customers_profile_data
   WHERE "isDeleted" = false AND "firstName" ILIKE 'N%'
   LIMIT 500;
`.trim();

export function extractSqlFromLlmResponse(raw: string): string {
  const fence = raw.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    return fence[1].trim();
  }
  return raw.trim();
}

const ALLOWED_TABLES = ["customers_profile_data", "kyc_dump"];

export function validateCustomerProfileSelectSql(sql: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = sql.trim();
  const withoutTrailingSemi = trimmed.replace(/;+\s*$/g, "");

  if (!/^select\s/i.test(trimmed)) {
    return { ok: false, reason: "Only SELECT queries are allowed." };
  }
  if (withoutTrailingSemi.includes(";")) {
    return { ok: false, reason: "Multiple statements are not allowed." };
  }
  if (trimmed.includes("--") || trimmed.includes("/*")) {
    return { ok: false, reason: "Comments are not allowed in the query." };
  }

  const forbidden = /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|EXECUTE|MERGE|CALL)\b/i;
  if (forbidden.test(trimmed)) {
    return { ok: false, reason: "Query contains disallowed keywords." };
  }
  if (/\bUNION\b/i.test(trimmed)) {
    return { ok: false, reason: "UNION is not allowed." };
  }
  if (!/\bFROM\s+["']?customers_profile_data["']?\b/i.test(trimmed)) {
    return { ok: false, reason: "Query must read from customers_profile_data." };
  }

  // Allow only (LEFT) JOIN with kyc_dump; no other tables permitted
  const joinPattern = /\b(?:LEFT\s+)?JOIN\s+["']?(\w+)["']?/gi;
  let match: RegExpExecArray | null;
  while ((match = joinPattern.exec(trimmed)) !== null) {
    const joinedTable = (match[1] ?? "").toLowerCase();
    if (!ALLOWED_TABLES.includes(joinedTable)) {
      return { ok: false, reason: `JOIN with table "${match[1] ?? ""}" is not allowed.` };
    }
  }

  return { ok: true };
}

export async function generateSqlFromNaturalLanguage(prompt: string): Promise<string> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const system = `You output a single PostgreSQL SELECT statement and nothing else — no markdown, no explanation, no backticks.

Schema reference:
${SCHEMA_HINT}

Rules:
1. Query customers_profile_data as the primary table. You may JOIN or LEFT JOIN kyc_dump when the query involves KYC step or KYC progress.
2. Every camelCase column name MUST be double-quoted (e.g. "firstName", "userID"). snake_case columns like "updated_at" do not need quotes but are fine with them.
3. Always include WHERE cpd."isDeleted" = false (or WHERE "isDeleted" = false when no alias is used).
4. Use ILIKE for case-insensitive text matching.
5. No UNION, subqueries referencing other tables, comments, or multiple statements.
6. Only JOIN kyc_dump — no other tables.
7. End with LIMIT 500 if no smaller LIMIT is already present.
8. When joining kyc_dump use aliases: customers_profile_data AS cpd, kyc_dump AS kd.
9. For KYC step queries always filter on kd."step" using the INTEGER value, never the label string.
10. CRITICAL: "KYC not started / not done / not begun" requires LEFT JOIN and filter (kd."step" = 0 OR kd."userID" IS NULL) because customers may have step=0 row OR no row at all in kyc_dump.
11. For steps 1–7 use INNER JOIN (row is guaranteed to exist).
12. Output raw SQL only — no markdown fences, no prose.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${errText}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return extractSqlFromLlmResponse(content);
}
