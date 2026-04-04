import { env } from "@packages/config/env";

/**
 * Complete column reference for customers_profile_data.
 * All camelCase names MUST be double-quoted in the generated SQL ("firstName", not first_name).
 */
const SCHEMA_HINT = `
Table name (exact): customers_profile_data

All columns — use the EXACT spelling below, double-quoted in SQL:
  "id"           INTEGER  — primary key
  "userName"     TEXT     — unique login handle
  "firstName"    TEXT     — given name
  "middleName"   TEXT
  "lastName"     TEXT     — family name
  "gender"       TEXT     — one of: 'MALE', 'FEMALE', 'OTHER', 'NA' (nullable)
  "legalEntityName" TEXT  — nullable, used for corporate accounts
  "emailAddress" TEXT     — unique email
  "phoneNo"      TEXT     — mobile number (nullable, unique)
  "whatsAppNo"   TEXT     — nullable
  "avatar"       TEXT     — nullable
  "userType"     TEXT     — one of: 'INDIVIDUAL', 'INDIVIDUAL_NRI_NRO', 'TRUST', 'CORPORATE', 'HUF', 'LLP', 'PARTNERSHIP_FIRM'
  "kycStatus"    TEXT     — one of: 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'RE_KYC'
  "kraStatus"    TEXT     — default 'PENDING'
  "VerifiedBy"   INTEGER  — nullable (FK to CRM user who verified)
  "verifyDate"   TIMESTAMPTZ — nullable
  "kycSubmitDate" TIMESTAMPTZ — nullable
  "useKraKyc"    BOOLEAN
  "isAFatcaCustomer" BOOLEAN
  "isAPep"       BOOLEAN
  "allowSEBITerms" BOOLEAN
  "isDeleted"    BOOLEAN  — soft-delete flag; always filter WHERE "isDeleted" = false unless asked otherwise
  "createdAt"    TIMESTAMPTZ
  "updatedAt"    TIMESTAMPTZ
  "createdBy"    INTEGER  — nullable (CRM user id)
  "customersAuthDataModelId" INTEGER — FK (internal, avoid filtering on this)

IMPORTANT:
- Every column name is camelCase and MUST be double-quoted: "firstName", NOT first_name.
- Do NOT reference any other table or use JOINs.
- Use ILIKE for case-insensitive text search.
- Example: customers whose firstName starts with 'A':
  SELECT "id","firstName","lastName","emailAddress","phoneNo" FROM customers_profile_data WHERE "isDeleted" = false AND "firstName" ILIKE 'A%' LIMIT 500;
`.trim();

export function extractSqlFromLlmResponse(raw: string): string {
  const fence = raw.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    return fence[1].trim();
  }
  return raw.trim();
}

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
  if (/\bJOIN\b/i.test(trimmed)) {
    return { ok: false, reason: "JOIN is not allowed." };
  }
  if (!/\bFROM\s+["']?customers_profile_data["']?\b/i.test(trimmed)) {
    return { ok: false, reason: "Query must read from customers_profile_data only." };
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
1. Query ONLY the table customers_profile_data.
2. Every camelCase column name MUST be double-quoted (e.g. "firstName", "emailAddress").
3. Always include WHERE "isDeleted" = false unless the user explicitly asks for deleted records.
4. Use ILIKE for case-insensitive text matching.
5. No JOINs, UNION, subqueries referencing other tables, comments, or multiple statements.
6. End with LIMIT 500 if no smaller LIMIT is already present.
7. Output raw SQL only — no markdown fences, no prose.`;

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
