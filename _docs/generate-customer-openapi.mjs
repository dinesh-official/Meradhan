#!/usr/bin/env node
/**
 * Generates _docs/meradhan-customer-api.openapi.json
 * Customer-level backend APIs only (excludes CRM-only routes).
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "meradhan-customer-api.openapi.json");

const jsonHeaders = [
  { $ref: "#/components/parameters/ContentTypeJson" },
  { $ref: "#/components/parameters/AcceptJson" },
];

const authUser = [
  { $ref: "#/components/parameters/AuthorizationBearer" },
  { $ref: "#/components/parameters/CookieToken" },
];

const stdResponses = {
  200: {
    description: "Success",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/BaseResponse" },
      },
    },
  },
  400: { $ref: "#/components/responses/BadRequest" },
  401: { $ref: "#/components/responses/Unauthorized" },
  429: { $ref: "#/components/responses/RateLimited" },
};

function op({
  tag,
  summary,
  description,
  operationId,
  security,
  parameters = [],
  requestBody,
  responses,
  method = "post",
}) {
  const o = {
    tags: [tag],
    summary,
    operationId,
    parameters: [...jsonHeaders, ...parameters, ...(security === "user" ? authUser : [])],
  };
  if (description) o.description = description;
  if (security === "user") o.security = [{ BearerAuth: [] }, { CookieAuth: [] }];
  if (security === "apiKey") {
    o.security = [{ ApiKeyAuth: [] }];
    o.parameters.push({ $ref: "#/components/parameters/XApiKey" });
  }
  if (requestBody) o.requestBody = requestBody;
  o.responses = responses ?? stdResponses;
  return o;
}

function body(schemaRef, example) {
  return {
    required: true,
    content: {
      "application/json": {
        schema: schemaRef.startsWith("#") ? { $ref: schemaRef } : schemaRef,
        ...(example ? { example } : {}),
      },
    },
  };
}

function qp(name, desc, schema = { type: "string" }, required = false) {
  return { name, in: "query", required, description: desc, schema };
}

function pp(name, desc, schema = { type: "string" }) {
  return { name, in: "path", required: true, description: desc, schema };
}

/** @type {Record<string, Record<string, object>>} */
const paths = {};

function add(method, path, operation) {
  const m = method.toLowerCase();
  if (!paths[path]) paths[path] = {};
  paths[path][m] = operation;
}

// ─── AUTH ───────────────────────────────────────────────────────────────────
const authTag = "Auth";
add("get", "/customer/session", op({ tag: authTag, summary: "Get current session", operationId: "getSession", security: "user", parameters: [], method: "get" }));
add("post", "/auth/customer/send-signup-mobile-verify", op({ tag: authTag, summary: "Send signup mobile OTP", operationId: "sendSignupMobileOtp", requestBody: body("#/components/schemas/SendMobileOtpBody", { mobile: "9876543210" }) }));
add("post", "/auth/customer/send-signup-email-verify", op({ tag: authTag, summary: "Send signup email OTP", operationId: "sendSignupEmailOtp", requestBody: body("#/components/schemas/SendEmailOtpBody", { email: "user@example.com", name: "Rahul Sharma" }) }));
add("post", "/auth/customer/verify-signup-otp", op({ tag: authTag, summary: "Verify signup OTP (query params)", operationId: "verifySignupOtp", parameters: [qp("otp", "OTP"), qp("token", "OTP token"), qp("verifyBy", "email or mobile"), qp("id", "Customer ID", { type: "string" }, true)], method: "post" }));
add("post", "/auth/customer/verify-signup-otp-both", op({ tag: authTag, summary: "Verify signup email + mobile OTP", operationId: "verifySignupOtpBoth", requestBody: body("#/components/schemas/SignUpVerifyBothBody") }));
add("post", "/auth/customer/signup/update-email", op({ tag: authTag, summary: "Update email during signup", operationId: "updateSignupEmail", requestBody: body("#/components/schemas/SignupUpdateEmailBody") }));
add("post", "/auth/customer/signup/update-phone", op({ tag: authTag, summary: "Update phone during signup", operationId: "updateSignupPhone", requestBody: body("#/components/schemas/SignupUpdatePhoneBody") }));
add("post", "/auth/customer/signup-with-credentials", op({ tag: authTag, summary: "Create account (signup)", operationId: "signUpWithCredentials", requestBody: body("#/components/schemas/CreateCustomerBody") }));
add("post", "/auth/customer/signin/request", op({ tag: authTag, summary: "Start sign-in (send OTP)", operationId: "signInRequest", requestBody: body("#/components/schemas/SignInRequestBody", { identity: "email", value: "user@example.com" }) }));
add("post", "/auth/customer/signin/send-otp", op({ tag: authTag, summary: "Resend sign-in OTP", operationId: "signInSendOtp", requestBody: body("#/components/schemas/SignInSendOtpBody") }));
add("post", "/auth/customer/signin/with-otp", op({ tag: authTag, summary: "Verify sign-in OTP", operationId: "signInVerifyOtp", requestBody: body("#/components/schemas/SignInVerifyOtpBody") }));
add("post", "/auth/customer/signin/2fa/verify", op({ tag: authTag, summary: "Verify 2FA passcode at login", operationId: "verifySignInTwoFactor", requestBody: body("#/components/schemas/SignInVerifyTwoFactorBody") }));
add("post", "/auth/customer/signin/account-activation/verify", op({ tag: authTag, summary: "Verify account activation OTP at login", operationId: "verifyAccountActivationAtLogin", requestBody: body("#/components/schemas/AccountActivationVerifyBody") }));
add("post", "/auth/customer/logout", op({ tag: authTag, summary: "Logout", operationId: "logout", security: "user" }));
add("get", "/auth/customer/logout", op({ tag: authTag, summary: "Logout (GET)", operationId: "logoutGet", security: "user", method: "get" }));
add("get", "/auth/customer/send-verify-email", op({ tag: authTag, summary: "Send email verification link", operationId: "sendVerifyEmail", security: "user", method: "get" }));
add("get", "/auth/customer/verify-email", op({ tag: authTag, summary: "Verify email via token", operationId: "verifyEmail", parameters: [qp("token", "Verification token", { type: "string" }, true)], method: "get" }));
add("post", "/auth/customer/resend-email-verification", op({ tag: authTag, summary: "Resend email verification (unverified login)", operationId: "resendEmailVerification", requestBody: body("#/components/schemas/SignInRequestBody") }));
add("get", "/auth/customer/2fa/settings", op({ tag: authTag, summary: "Get 2FA settings", operationId: "getTwoFactorSettings", security: "user", method: "get" }));
add("patch", "/auth/customer/2fa/settings", op({ tag: authTag, summary: "Update 2FA settings", operationId: "updateTwoFactorSettings", security: "user", requestBody: body("#/components/schemas/TwoFactorSettingsUpdateBody"), method: "patch" }));

// ─── PROFILE ────────────────────────────────────────────────────────────────
const profileTag = "Profile";
add("post", "/auth/customer/profile/mobile", op({ tag: profileTag, summary: "Request mobile update", operationId: "requestMobileUpdate", security: "user", requestBody: body("#/components/schemas/MobileUpdateRequestBody") }));
add("post", "/auth/customer/profile/mobile/send-otp", op({ tag: profileTag, summary: "Send mobile update OTP", operationId: "sendMobileUpdateOtp", security: "user", requestBody: body("#/components/schemas/SendMobileOtpBody") }));
add("post", "/auth/customer/profile/mobile/verify", op({ tag: profileTag, summary: "Verify mobile update OTP", operationId: "verifyMobileUpdate", security: "user", requestBody: body("#/components/schemas/MobileVerifyBody") }));
add("post", "/auth/customer/profile/email-verification/send-otp", op({ tag: profileTag, summary: "Send profile email verification OTP", operationId: "sendProfileEmailVerifyOtp", security: "user", requestBody: body("#/components/schemas/EmailVerifySendOtpBody") }));
add("post", "/auth/customer/profile/email-verification/verify", op({ tag: profileTag, summary: "Verify profile email OTP", operationId: "verifyProfileEmailOtp", security: "user", requestBody: body("#/components/schemas/EmailVerifyConfirmBody") }));
add("post", "/auth/customer/profile/email/send-otp", op({ tag: profileTag, summary: "Send email change OTP", operationId: "sendEmailChangeOtp", security: "user", requestBody: body("#/components/schemas/EmailChangeSendOtpBody") }));
add("post", "/auth/customer/profile/email/verify", op({ tag: profileTag, summary: "Verify email change OTP", operationId: "verifyEmailChange", security: "user", requestBody: body("#/components/schemas/EmailChangeVerifyBody") }));
add("post", "/auth/customer/profile/whatsapp", op({ tag: profileTag, summary: "Toggle WhatsApp notifications", operationId: "toggleWhatsApp", security: "user", requestBody: body("#/components/schemas/WhatsAppToggleBody", { enableWhatsApp: true }) }));
add("post", "/auth/customer/profile/bank-account", op({ tag: profileTag, summary: "Add bank account", operationId: "addBankAccount", security: "user", requestBody: body("#/components/schemas/BankAccountBody") }));
add("delete", "/auth/customer/profile/bank-account/{bankAccountId}", op({ tag: profileTag, summary: "Remove bank account", operationId: "removeBankAccount", security: "user", parameters: [pp("bankAccountId", "Bank account ID", { type: "integer" })], method: "delete" }));
add("post", "/auth/customer/profile/bank-account/primary/{bankAccountId}", op({ tag: profileTag, summary: "Set primary bank account", operationId: "setPrimaryBankAccount", security: "user", parameters: [pp("bankAccountId", "Bank account ID", { type: "integer" })] }));
add("post", "/auth/customer/profile/demat-account", op({ tag: profileTag, summary: "Add demat account", operationId: "addDematAccount", security: "user", requestBody: body("#/components/schemas/DematAccountBody") }));
add("delete", "/auth/customer/profile/demat-account/{dematAccountId}", op({ tag: profileTag, summary: "Remove demat account", operationId: "removeDematAccount", security: "user", parameters: [pp("dematAccountId", "Demat account ID", { type: "integer" })], method: "delete" }));
add("post", "/auth/customer/profile/demat-account/primary/{dematAccountId}", op({ tag: profileTag, summary: "Set primary demat account", operationId: "setPrimaryDematAccount", security: "user", parameters: [pp("dematAccountId", "Demat account ID", { type: "integer" })] }));
add("post", "/auth/customer/profile/risk-profile", op({ tag: profileTag, summary: "Save risk profile answers", operationId: "saveRiskProfile", security: "user", requestBody: { required: true, content: { "application/json": { schema: { type: "array", items: { type: "object", additionalProperties: true } } } } } }));
add("get", "/auth/customer/corporate-kyc/risk-profile/questions", op({ tag: profileTag, summary: "Corporate risk profile questions", operationId: "getCorporateRiskQuestions", security: "user", method: "get" }));
add("get", "/auth/customer/corporate-kyc/e-sign-requests/pending", op({ tag: profileTag, summary: "List pending corporate e-sign requests", operationId: "listPendingCorporateESign", security: "user", method: "get" }));
add("get", "/auth/customer/corporate-kyc/e-sign-requests/{requestId}", op({ tag: profileTag, summary: "Get corporate e-sign request", operationId: "getCorporateESignRequest", security: "user", parameters: [pp("requestId", "E-sign request ID", { type: "integer" })], method: "get" }));
add("post", "/auth/customer/corporate-kyc/e-sign-requests/{requestId}/digio-request", op({ tag: profileTag, summary: "Initiate Digio e-sign", operationId: "digioRequestCorporateESign", security: "user", parameters: [pp("requestId", "E-sign request ID", { type: "integer" })] }));
add("post", "/auth/customer/corporate-kyc/e-sign-requests/{requestId}/digio-verify", op({ tag: profileTag, summary: "Verify Digio e-sign completion", operationId: "digioVerifyCorporateESign", security: "user", parameters: [pp("requestId", "E-sign request ID", { type: "integer" })] }));

// ─── KYC ────────────────────────────────────────────────────────────────────
const kycTag = "KYC";
add("post", "/customer/kyc/pan/info-verify", op({ tag: kycTag, summary: "PAN info pre-check", operationId: "panInfoVerify", security: "user", requestBody: body("#/components/schemas/PanInfoVerifyBody") }));
add("post", "/customer/kyc/pan/request", op({ tag: kycTag, summary: "Create PAN verification request", operationId: "panVerifyRequest", security: "user", requestBody: body("#/components/schemas/PanVerifyRequestBody") }));
add("get", "/customer/kyc/pan/response/{kid}", op({ tag: kycTag, summary: "Poll PAN verification result", operationId: "panVerifyResponse", security: "user", parameters: [pp("kid", "KYC request ID")], method: "get" }));
add("post", "/customer/kyc/aadhaar/request", op({ tag: kycTag, summary: "Create Aadhaar verification request", operationId: "aadhaarVerifyRequest", security: "user", requestBody: body("#/components/schemas/AadhaarVerifyRequestBody") }));
add("post", "/customer/kyc/kra/request", op({ tag: kycTag, summary: "Create KRA verification request", operationId: "kraVerifyRequest", security: "user", requestBody: body("#/components/schemas/KraVerifyRequestBody") }));
add("post", "/customer/kyc/selfie/request", op({ tag: kycTag, summary: "Create selfie/liveness request", operationId: "selfieVerifyRequest", security: "user", requestBody: body("#/components/schemas/SelfieVerifyRequestBody") }));
add("get", "/customer/kyc/selfie/response/{kid}", op({ tag: kycTag, summary: "Poll selfie verification result", operationId: "selfieVerifyResponse", security: "user", parameters: [pp("kid", "KYC request ID")], method: "get" }));
add("post", "/customer/kyc/sign/request", op({ tag: kycTag, summary: "Create signature verification request", operationId: "signVerifyRequest", security: "user", requestBody: body("#/components/schemas/SignVerifyRequestBody") }));
add("get", "/customer/kyc/sign/response/{kid}", op({ tag: kycTag, summary: "Poll signature verification result", operationId: "signVerifyResponse", security: "user", parameters: [pp("kid", "KYC request ID")], method: "get" }));
add("get", "/bank/{ifsc}", op({ tag: kycTag, summary: "Lookup bank by IFSC", operationId: "fetchIfscInfo", parameters: [pp("ifsc", "IFSC code")], method: "get" }));
add("post", "/customer/kyc/bank/verify", op({ tag: kycTag, summary: "Verify bank account", operationId: "verifyBankAccount", security: "user", requestBody: body("#/components/schemas/BankVerifyBody") }));
add("post", "/customer/kyc/demat/submit", op({ tag: kycTag, summary: "Submit demat account for KYC", operationId: "verifyDematAccount", security: "user", requestBody: body("#/components/schemas/DematAccountBody") }));
add("post", "/customer/kyc/esign/request", op({ tag: kycTag, summary: "Initiate KYC e-sign", operationId: "kycEsignRequest", security: "user", requestBody: body("#/components/schemas/EsignRequestBody") }));
add("get", "/customer/kyc/esign/verify/{doc}", op({ tag: kycTag, summary: "Verify KYC e-sign status", operationId: "kycEsignVerify", security: "user", parameters: [pp("doc", "Document ID")], method: "get" }));
add("get", "/customer/kyc/store/get", op({ tag: kycTag, summary: "Get stored KYC data", operationId: "getKycStore", security: "user", method: "get" }));
add("post", "/customer/kyc/store/{step}", op({ tag: kycTag, summary: "Save KYC step data", operationId: "setKycStore", security: "user", parameters: [pp("step", "KYC step number", { type: "integer" })], requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } } }));
add("get", "/customer/kyc/level/{customerId}", op({ tag: kycTag, summary: "Get KYC completion level", operationId: "getKycLevel", security: "user", parameters: [pp("customerId", "Customer ID", { type: "integer" })], method: "get" }));
add("post", "/customer/kyc/audit-log/{customerId}", op({ tag: kycTag, summary: "Add KYC audit log entry", operationId: "addKycAuditLog", security: "user", parameters: [pp("customerId", "Customer ID", { type: "integer" })], requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } } }));
add("post", "/customer/kyc/current-step/{customerId}", op({ tag: kycTag, summary: "Update current KYC step", operationId: "setCurrentKycStep", security: "user", parameters: [pp("customerId", "Customer ID", { type: "integer" })], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { step: { type: "integer" } } } } } } }));
add("post", "/customer/kra/status/{customerId}", op({ tag: kycTag, summary: "Check if KRA process is running", operationId: "isKraRunning", security: "user", parameters: [pp("customerId", "Customer ID", { type: "integer" })] }));
add("get", "/customer/kyc/download-pdf/{id}", op({ tag: kycTag, summary: "Download KYC PDF", operationId: "downloadKycPdf", security: "user", parameters: [pp("id", "KYC flow ID", { type: "integer" })], method: "get", responses: { 200: { description: "PDF file", content: { "application/pdf": { schema: { type: "string", format: "binary" } } } } } }));

// ─── ORDERS ─────────────────────────────────────────────────────────────────
const orderTag = "Orders";
add("get", "/customer/order/payment-gateway-mode", op({ tag: orderTag, summary: "Get payment gateway mode", operationId: "getPaymentGatewayMode", security: "user", method: "get" }));
add("post", "/customer/order/preview", op({ tag: orderTag, summary: "Preview order pricing", operationId: "previewOrder", security: "user", requestBody: body("#/components/schemas/OrderPreviewBody") }));
add("post", "/customer/order/pay", op({ tag: orderTag, summary: "Create order and pay", operationId: "createOrder", security: "user", requestBody: body("#/components/schemas/OrderPayBody") }));
add("post", "/customer/order/cancel", op({ tag: orderTag, summary: "Cancel order (body)", operationId: "cancelOrderBody", security: "user", requestBody: body("#/components/schemas/CancelOrderBody") }));
add("post", "/customer/order/cancel/{orderId}", op({ tag: orderTag, summary: "Cancel order by order number", operationId: "cancelOrderById", security: "user", parameters: [pp("orderId", "Order number")] }));
add("post", "/customer/order/status/{orderId}", op({ tag: orderTag, summary: "Update order status", operationId: "setOrderStatus", security: "user", parameters: [pp("orderId", "Order number")], requestBody: body("#/components/schemas/SetOrderStatusBody") }));
add("get", "/customer/order/history", op({ tag: orderTag, summary: "Order history (paginated)", operationId: "getOrderHistory", security: "user", parameters: [qp("page", "Page", { type: "string", default: "1" }), qp("limit", "Page size", { type: "string", default: "10" }), qp("status", "Filter: PENDING|SETTLED|APPLIED|REJECTED|IN_PROGRESS|EXPIRED|CANCELLED|NOT_COMPLETED"), qp("bondType", "PRIMARY or SECONDARY")], method: "get" }));
add("get", "/customer/order/{orderNumber}/receipt-pdf", op({ tag: orderTag, summary: "Download order receipt PDF", operationId: "downloadReceiptPdf", security: "user", parameters: [pp("orderNumber", "Order number")], method: "get", responses: { 200: { description: "PDF", content: { "application/pdf": { schema: { type: "string", format: "binary" } } } } } }));
add("get", "/customer/order/{orderNumber}/deal-pdf", op({ tag: orderTag, summary: "Download deal sheet PDF", operationId: "downloadDealPdf", security: "user", parameters: [pp("orderNumber", "Order number")], method: "get", responses: { 200: { description: "PDF", content: { "application/pdf": { schema: { type: "string", format: "binary" } } } } } }));
add("get", "/customer/order/pdf", op({ tag: orderTag, summary: "Generate temporary order PDF", operationId: "getOrderPdf", security: "user", parameters: [qp("orderId", "Order ID"), qp("isin", "ISIN"), qp("qun", "Quantity"), qp("isReleased", "true/false")], method: "get" }));
add("post", "/customer/order/pdf", op({ tag: orderTag, summary: "Generate temporary order PDF (POST)", operationId: "getOrderPdfPost", security: "user" }));
add("post", "/customer/order/log", op({ tag: orderTag, summary: "Add order flow log", operationId: "addOrderLog", security: "user", requestBody: body("#/components/schemas/OrderLogBody") }));

// ─── PAYMENT ────────────────────────────────────────────────────────────────
add("post", "/customer/payment/webhook", op({ tag: "Payment", summary: "Razorpay payment webhook", operationId: "razorpayWebhook", description: "Raw JSON body; verified via Razorpay signature header.", parameters: [{ name: "x-razorpay-signature", in: "header", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } } }));

// ─── PORTFOLIO ──────────────────────────────────────────────────────────────
const portfolioTag = "Portfolio";
for (const ep of [
  ["total-invested", "getTotalInvested"],
  ["average-maturity", "getAverageMaturity"],
  ["average-yield", "getAverageYield"],
  ["investment-by-rating", "getInvestmentByRating"],
  ["investment-allocation", "getInvestmentAllocation"],
  ["investment-by-maturity", "getInvestmentByMaturity"],
  ["investment-by-issuer-type", "getInvestmentByIssuerType"],
  ["summary", "getPortfolioSummary"],
  ["cashflow-timeline", "getCashflowTimeline"],
  ["cashflow-maturity", "getCashflowToMaturity"],
]) {
  add("get", `/customer/portfolio/${ep[0]}`, op({ tag: portfolioTag, summary: ep[0].replace(/-/g, " "), operationId: ep[1], security: "user", method: "get" }));
}
add("get", "/customer/portfolio/details", op({ tag: portfolioTag, summary: "Portfolio holdings (GET)", operationId: "getPortfolioDetails", security: "user", parameters: [qp("page", "Page"), qp("limit", "Limit"), qp("search", "Search ISIN/name")], method: "get" }));
add("post", "/customer/portfolio/details", op({ tag: portfolioTag, summary: "Portfolio holdings (POST with filters)", operationId: "postPortfolioDetails", security: "user", requestBody: { required: false, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } } }));
add("get", "/customer/portfolio/details/filters", op({ tag: portfolioTag, summary: "Portfolio filter options", operationId: "getPortfolioFilters", security: "user", method: "get" }));

// ─── CUSTOMER BONDS ─────────────────────────────────────────────────────────
add("get", "/customer/bonds", op({ tag: "Customer Bonds", summary: "Customer owned bonds", operationId: "getCustomerBonds", security: "user", method: "get" }));

// ─── WATCHLIST ──────────────────────────────────────────────────────────────
const wlTag = "Watchlist";
add("get", "/watchlist/bonds", op({ tag: wlTag, summary: "Get bond watchlist", operationId: "getBondWatchlist", security: "user", method: "get" }));
add("get", "/watchlist/bonds/manage", op({ tag: wlTag, summary: "Toggle bond in watchlist", operationId: "toggleBondWatchlist", security: "user", parameters: [qp("isin", "Bond ISIN", { type: "string" }, true)], method: "get" }));
add("get", "/watchlist/issuer", op({ tag: wlTag, summary: "Get issuer watchlist", operationId: "getIssuerWatchlist", security: "user", method: "get" }));
add("get", "/watchlist/issuer/manage", op({ tag: wlTag, summary: "Toggle issuer watchlist", operationId: "toggleIssuerWatchlist", security: "user", parameters: [qp("issuerId", "Issuer ID", { type: "string" }, true)], method: "get" }));

// ─── BONDS CATALOG ──────────────────────────────────────────────────────────
const bondsTag = "Bonds";
add("get", "/bonds/homepage", op({ tag: bondsTag, summary: "Homepage bonds", operationId: "getHomepageBonds", parameters: [qp("limit", "Limit", { type: "string" })], method: "get" }));
add("get", "/bonds/ongoing-deals", op({ tag: bondsTag, summary: "Ongoing deals", operationId: "getOngoingDeals", method: "get" }));
add("get", "/bonds/latest", op({ tag: bondsTag, summary: "Latest listed bonds", operationId: "getLatestBonds", method: "get" }));
add("get", "/latest", op({ tag: bondsTag, summary: "Latest bonds (alias)", operationId: "getLatestBondsAlias", method: "get" }));
add("get", "/bonds/search", op({ tag: bondsTag, summary: "Bond search autocomplete", operationId: "searchBonds", parameters: [qp("q", "Search query"), qp("limit", "Limit")], method: "get" }));
add("get", "/bonds/upcoming", op({ tag: bondsTag, summary: "Upcoming bonds", operationId: "getUpcomingBonds", method: "get" }));
add("get", "/bonds/high-yield", op({ tag: bondsTag, summary: "High yield bonds", operationId: "getHighYieldBonds", method: "get" }));
add("get", "/bonds/zero-coupon", op({ tag: bondsTag, summary: "Zero coupon bonds", operationId: "getZeroCouponBonds", method: "get" }));
add("post", "/bonds/listed/filter", op({ tag: bondsTag, summary: "Filter listed bonds", operationId: "filterListedBonds", parameters: [qp("page", "Page"), qp("limit", "Limit"), qp("category", "Category e.g. all"), qp("sort", "Sort token e.g. yield_desc")], requestBody: body("#/components/schemas/BondsFilterBody") }));
add("get", "/bonds/filter-options", op({ tag: bondsTag, summary: "Bond filter dropdown options", operationId: "getBondFilterOptions", parameters: [qp("category", "Category")], method: "get" }));
add("get", "/bonds/{isin}/cashflow", op({ tag: bondsTag, summary: "Bond cashflow schedule", operationId: "getBondCashflow", parameters: [pp("isin", "ISIN")], method: "get" }));
add("get", "/bonds/{isin}/documents", op({ tag: bondsTag, summary: "List bond documents", operationId: "listBondDocuments", parameters: [pp("isin", "ISIN")], description: "Optional auth enriches response.", method: "get" }));
add("get", "/bonds/{isin}/order-pricing", op({ tag: bondsTag, summary: "Order pricing for bond", operationId: "getBondOrderPricing", parameters: [pp("isin", "ISIN"), qp("quantity", "Quantity", { type: "integer" })], method: "get" }));
add("get", "/bonds/{isin}/deal-autofill", op({ tag: bondsTag, summary: "Deal autofill data", operationId: "getBondDealAutofill", parameters: [pp("isin", "ISIN")], method: "get" }));
add("post", "/bonds/{isin}/deal-autofill", op({ tag: bondsTag, summary: "Deal autofill (POST body)", operationId: "postBondDealAutofill", parameters: [pp("isin", "ISIN")], requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { pricingYield: { type: "number" } } } } } } }));
add("get", "/bonds/{isin}/deal-autofill-calc", op({ tag: bondsTag, summary: "Calc-based deal autofill", operationId: "getBondDealAutofillCalc", parameters: [pp("isin", "ISIN")], method: "get" }));
add("post", "/bonds/{isin}/deal-autofill-calc", op({ tag: bondsTag, summary: "Calc-based deal autofill (POST)", operationId: "postBondDealAutofillCalc", parameters: [pp("isin", "ISIN")] }));
add("get", "/bonds/{isin}", op({ tag: bondsTag, summary: "Bond details by ISIN", operationId: "getBondDetails", parameters: [pp("isin", "ISIN")], method: "get" }));
add("post", "/bonds/place-order", op({ tag: bondsTag, summary: "Place bond order (logged-in)", operationId: "placeBondOrder", security: "user", requestBody: body("#/components/schemas/PlaceOrderBody") }));

// ─── PUBLIC BONDS API (API KEY) ─────────────────────────────────────────────
add("post", "/public/bonds", op({ tag: "Public Bonds API", summary: "Public bond list (API key)", operationId: "publicBondList", security: "apiKey", parameters: [qp("page", "Page", { type: "integer", default: 1 }), qp("limit", "Limit max 200", { type: "integer", default: 100 })], requestBody: body("#/components/schemas/BondsFilterBody") }));
add("get", "/public/bonds/{isin}", op({ tag: "Public Bonds API", summary: "Public bond by ISIN (API key)", operationId: "publicBondByIsin", security: "apiKey", parameters: [pp("isin", "ISIN")], method: "get" }));

// ─── AUDIT LOGS ─────────────────────────────────────────────────────────────
const auditTag = "Audit Logs";
add("post", "/auditlogs/meradhan/tracing/init", op({ tag: auditTag, summary: "Init analytics session", operationId: "tracingInit", security: "user", requestBody: body("#/components/schemas/TracingInitBody") }));
add("post", "/auditlogs/meradhan/page-tracking/start", op({ tag: auditTag, summary: "Start page tracking", operationId: "pageTrackingStart", security: "user", requestBody: body("#/components/schemas/PageViewBody") }));
add("post", "/auditlogs/meradhan/page-tracking/end/{pageId}", op({ tag: auditTag, summary: "End page tracking", operationId: "pageTrackingEnd", security: "user", parameters: [pp("pageId", "Page view ID", { type: "integer" })], requestBody: body("#/components/schemas/EndPageViewBody") }));
add("post", "/auditlogs/meradhan/page-tracking/update/{pageId}", op({ tag: auditTag, summary: "Update page tracking", operationId: "pageTrackingUpdate", security: "user", parameters: [pp("pageId", "Page view ID", { type: "integer" })], requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } } }));
add("get", "/auditlogs/meradhan/activity-logs", op({ tag: auditTag, summary: "Activity logs (own user)", operationId: "getActivityLogs", security: "user", parameters: [qp("page", "Page"), qp("pageSize", "Page size"), qp("startDate", "ISO date"), qp("endDate", "ISO date")], method: "get" }));
add("get", "/auditlogs/meradhan/login-logs", op({ tag: auditTag, summary: "Login logs (own user)", operationId: "getLoginLogs", security: "user", parameters: [qp("page", "Page"), qp("pageSize", "Page size")], method: "get" }));
add("get", "/auditlogs/meradhan/session-logs", op({ tag: auditTag, summary: "Session logs (own user)", operationId: "getSessionLogs", security: "user", parameters: [qp("page", "Page"), qp("pageSize", "Page size")], method: "get" }));
add("post", "/auditlogs/meradhan/create/activity", op({ tag: auditTag, summary: "Create activity log", operationId: "createActivityLog", security: "user", requestBody: body("#/components/schemas/ActivityLogBody") }));
add("post", "/web/tracking", op({ tag: auditTag, summary: "Web tracking events", operationId: "webTracking", security: "user", requestBody: { required: true, content: { "application/json": { schema: { oneOf: [{ $ref: "#/components/schemas/WebTrackingEvent" }, { type: "array", items: { $ref: "#/components/schemas/WebTrackingEvent" } }] } } } } }));
add("get", "/web/tracking", op({ tag: auditTag, summary: "Web tracking (GET)", operationId: "webTrackingGet", security: "user", method: "get" }));
add("post", "/web/tracking/revalidate", op({ tag: auditTag, summary: "Revalidate web tracking session", operationId: "webTrackingRevalidate", security: "user", requestBody: body("#/components/schemas/RevalidateTrackingBody") }));
add("get", "/web/tracking/revalidate", op({ tag: auditTag, summary: "Revalidate web tracking (GET)", operationId: "webTrackingRevalidateGet", security: "user", method: "get" }));

// ─── COMMON ─────────────────────────────────────────────────────────────────
add("post", "/contact/submit", op({ tag: "Common", summary: "Contact form", operationId: "contactSubmit", requestBody: body("#/components/schemas/ContactBody") }));
add("post", "/partnership/submit", op({ tag: "Common", summary: "Partnership inquiry", operationId: "partnershipSubmit", requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } } }));
add("post", "/strapi/files/upload", op({ tag: "Common", summary: "Strapi CMS file upload", operationId: "strapiUpload", requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } } } } }));
add("post", "/files/upload", op({ tag: "Common", summary: "Upload file to S3", operationId: "uploadFileS3", security: "user", requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } } } } }));
add("get", "/files-public/{path}", op({ tag: "Common", summary: "Public S3 file proxy", operationId: "getPublicFile", parameters: [pp("path", "S3 key path"), qp("token", "Static access token", { type: "string" }, true)], method: "get", responses: { 200: { description: "File stream", content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } } } } }));
add("get", "/files/{path}", op({ tag: "Common", summary: "Authenticated S3 file", operationId: "getAuthFile", security: "user", parameters: [pp("path", "S3 key path")], method: "get" }));
add("get", "/uploads/{path}", op({ tag: "Common", summary: "Authenticated local upload file", operationId: "getLocalUpload", security: "user", parameters: [pp("path", "Upload path")], method: "get" }));

// ─── HEALTH ─────────────────────────────────────────────────────────────────
add("get", "/health", op({ tag: "System", summary: "Health check", operationId: "healthCheck", method: "get", responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" } } } } } } } }));

const spec = {
  openapi: "3.0.3",
  info: {
    title: "MeraDhan Customer API",
    description:
      "Complete OpenAPI specification for MeraDhan **customer-level** backend APIs.\n\n" +
      "**Excluded:** CRM-only routes (`/api/crm/*`), CRM bond create/update, CRM web tracking list endpoints.\n\n" +
      "**Authentication:**\n" +
      "- `Authorization: Bearer <jwt>` OR `Cookie: token=<jwt>`\n" +
      "- Public routes: no auth\n" +
      "- Public Bonds API: `x-api-key` header\n\n" +
      "**Standard response envelope:** `{ statusCode, success, message, responseData? }`",
    version: "1.0.0",
    contact: { name: "MeraDhan API Support", email: "support@meradhan.co" },
  },
  servers: [
    { url: "http://localhost:4000/api", description: "Local backend" },
    { url: "https://aws-api.meradhan.co/api", description: "Staging" },
    { url: "https://api.meradhan.co/api", description: "Production" },
  ],
  tags: [
    { name: "Auth", description: "Signup, sign-in, session, 2FA" },
    { name: "Profile", description: "Profile, bank/demat, corporate e-sign" },
    { name: "KYC", description: "KYC verification pipeline" },
    { name: "Orders", description: "Bond orders and PDFs" },
    { name: "Payment", description: "Payment webhooks" },
    { name: "Portfolio", description: "Portfolio analytics" },
    { name: "Customer Bonds", description: "Customer-owned bonds" },
    { name: "Watchlist", description: "Bond and issuer watchlists" },
    { name: "Bonds", description: "Public bond catalog" },
    { name: "Public Bonds API", description: "API-key authenticated public bond feed" },
    { name: "Audit Logs", description: "Meradhan tracking and activity logs" },
    { name: "Common", description: "Contact, files, uploads" },
    { name: "System", description: "Health check" },
  ],
  paths,
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      CookieAuth: { type: "apiKey", in: "cookie", name: "token" },
      ApiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key" },
    },
    parameters: {
      ContentTypeJson: { name: "Content-Type", in: "header", required: true, schema: { type: "string", enum: ["application/json"], default: "application/json" } },
      AcceptJson: { name: "Accept", in: "header", schema: { type: "string", default: "application/json" } },
      AuthorizationBearer: { name: "Authorization", in: "header", schema: { type: "string" }, example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
      CookieToken: { name: "Cookie", in: "header", schema: { type: "string" }, example: "token=eyJhbG...; userId=42" },
      XApiKey: { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
    },
    schemas: {
      BaseResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          success: { type: "boolean", example: true },
          message: { type: "string" },
          responseData: { type: "object", additionalProperties: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "boolean", example: false },
          code: { type: "string" },
          message: { type: "string" },
        },
      },
      SendMobileOtpBody: { type: "object", required: ["mobile"], properties: { mobile: { type: "string", pattern: "^[0-9]{10}$", example: "9876543210" } } },
      SendEmailOtpBody: { type: "object", required: ["email", "name"], properties: { email: { type: "string", format: "email" }, name: { type: "string" } } },
      SignUpVerifyBothBody: {
        type: "object",
        required: ["id", "emailOtp", "emailToken", "mobileOtp", "mobileToken"],
        properties: {
          id: { type: "integer" },
          emailOtp: { type: "string", minLength: 6, maxLength: 6 },
          emailToken: { type: "string" },
          mobileOtp: { type: "string", minLength: 4, maxLength: 4 },
          mobileToken: { type: "string" },
        },
      },
      SignupUpdateEmailBody: { type: "object", required: ["customerId", "newEmail"], properties: { customerId: { type: "integer" }, newEmail: { type: "string", format: "email" } } },
      SignupUpdatePhoneBody: { type: "object", required: ["customerId", "newPhone"], properties: { customerId: { type: "integer" }, newPhone: { type: "string", pattern: "^[5-9][0-9]{9}$" } } },
      CreateCustomerBody: {
        type: "object",
        required: ["firstName", "lastName", "emailId", "phoneNo", "whatsAppNo", "userType", "termsAccepted"],
        properties: {
          firstName: { type: "string", example: "Rahul" },
          lastName: { type: "string", example: "Sharma" },
          middleName: { type: "string" },
          emailId: { type: "string", format: "email", example: "user@example.com" },
          phoneNo: { type: "string", pattern: "^[5-9][0-9]{9}$", example: "9876543210" },
          whatsAppNo: { type: "string", pattern: "^[5-9][0-9]{9}$" },
          userType: { type: "string", enum: ["INDIVIDUAL", "INDIVIDUAL_NRI_NRO", "TRUST", "CORPORATE", "HUF", "LLP", "PARTNERSHIP_FIRM"], example: "INDIVIDUAL" },
          termsAccepted: { type: "boolean", example: true },
          whatsAppNotificationAllow: { type: "boolean", example: true },
        },
      },
      SignInRequestBody: {
        type: "object",
        required: ["identity", "value"],
        properties: {
          identity: { type: "string", enum: ["email", "phoneNo"] },
          value: { type: "string" },
          sendActivationOtp: { type: "boolean" },
        },
      },
      SignInSendOtpBody: { type: "object", required: ["identity", "value"], properties: { identity: { type: "string", enum: ["email", "phoneNo"] }, value: { type: "string" } } },
      SignInVerifyOtpBody: {
        type: "object",
        required: ["identity", "value", "otp", "token"],
        properties: {
          identity: { type: "string", enum: ["email", "phoneNo"] },
          value: { type: "string" },
          otp: { type: "string", minLength: 4 },
          token: { type: "string" },
        },
      },
      SignInVerifyTwoFactorBody: {
        type: "object",
        required: ["passcode", "challengeToken"],
        properties: { passcode: { type: "string", pattern: "^\\d{6}$" }, challengeToken: { type: "string" } },
      },
      AccountActivationVerifyBody: {
        type: "object",
        required: ["identity", "value", "otp", "token"],
        properties: { identity: { type: "string", enum: ["email", "phoneNo"] }, value: { type: "string" }, otp: { type: "string" }, token: { type: "string" } },
      },
      TwoFactorSettingsUpdateBody: {
        type: "object",
        required: ["enabled"],
        properties: { enabled: { type: "boolean" }, passcode: { type: "string", pattern: "^\\d{6}$" }, confirmPasscode: { type: "string", pattern: "^\\d{6}$" } },
      },
      MobileUpdateRequestBody: { type: "object", properties: { mobile: { type: "string", pattern: "^[5-9][0-9]{9}$" } } },
      MobileVerifyBody: { type: "object", properties: { otp: { type: "string" }, token: { type: "string" }, mobile: { type: "string" } } },
      EmailVerifySendOtpBody: { type: "object", properties: { email: { type: "string", format: "email" } } },
      EmailVerifyConfirmBody: { type: "object", properties: { otp: { type: "string" }, token: { type: "string" } } },
      EmailChangeSendOtpBody: { type: "object", properties: { newEmail: { type: "string", format: "email" } } },
      EmailChangeVerifyBody: { type: "object", properties: { otp: { type: "string" }, token: { type: "string" }, newEmail: { type: "string", format: "email" } } },
      WhatsAppToggleBody: { type: "object", properties: { enableWhatsApp: { type: "boolean" } } },
      BankAccountBody: {
        type: "object",
        properties: {
          accountHolderName: { type: "string" },
          bankAccountType: { type: "string", enum: ["SAVING", "CURRENT", "SALARY"] },
          accountNumber: { type: "string" },
          ifscCode: { type: "string" },
          bankName: { type: "string" },
          branch: { type: "string" },
        },
      },
      DematAccountBody: {
        type: "object",
        properties: {
          depositoryName: { type: "string", enum: ["NSDL", "CDSL"] },
          dpId: { type: "string" },
          clientId: { type: "string" },
          accountType: { type: "string", enum: ["SINGLE", "JOINT"] },
          accountHolderName: { type: "string" },
        },
      },
      PanInfoVerifyBody: { type: "object", properties: { panCardNo: { type: "string" }, dateOfBirth: { type: "string" } } },
      PanVerifyRequestBody: { type: "object", additionalProperties: true },
      AadhaarVerifyRequestBody: { type: "object", additionalProperties: true },
      KraVerifyRequestBody: { type: "object", additionalProperties: true },
      SelfieVerifyRequestBody: { type: "object", additionalProperties: true },
      SignVerifyRequestBody: { type: "object", additionalProperties: true },
      BankVerifyBody: { type: "object", additionalProperties: true },
      EsignRequestBody: { type: "object", additionalProperties: true },
      OrderPreviewBody: {
        type: "object",
        properties: {
          isin: { type: "string", example: "INE123A01012" },
          quantity: { type: "integer", minimum: 1, example: 10 },
          sellPrice: { type: "number" },
        },
      },
      OrderPayBody: {
        type: "object",
        required: ["paymentOrderId", "paymentId", "signature"],
        properties: {
          paymentOrderId: { type: "string" },
          paymentId: { type: "string" },
          signature: { type: "string" },
        },
      },
      CancelOrderBody: { type: "object", properties: { orderId: { type: "string" } } },
      SetOrderStatusBody: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["PENDING", "SETTLED", "APPLIED", "REJECTED", "IN_PROGRESS"] } } },
      OrderLogBody: {
        type: "object",
        required: ["orderId", "step", "status"],
        properties: {
          orderId: { type: "integer" },
          step: { type: "string" },
          status: { type: "string" },
          outputData: { type: "object" },
          details: { type: "object" },
        },
      },
      BondsFilterBody: {
        type: "object",
        properties: {
          search: { type: "string" },
          maturity: { type: "array", items: { type: "string", enum: ["0-2", "2-5", "5-10", "10-20", "20+"] } },
          rating: { type: "array", items: { type: "string" } },
          coupon: { type: "array", items: { type: "string", enum: ["4-7", "8-10", "10+"] } },
          taxation: { type: "array", items: { type: "string", enum: ["TAX_FREE", "TAXABLE", "TAX_SAVING", "TAX_EXEMPTION", "UNKNOWN"] } },
          interest: { type: "array", items: { type: "string", enum: ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY", "ON_MATURITY", "UNKNOWN"] } },
          allowForPurchase: { type: "boolean" },
        },
      },
      PlaceOrderBody: { type: "object", additionalProperties: true },
      TracingInitBody: { type: "object", required: ["sessionId"], properties: { sessionId: { type: "string" }, userId: { type: "integer" } } },
      PageViewBody: {
        type: "object",
        required: ["sessionId", "pagePath", "pageTitle", "entryTime", "scrollDepth", "interactions"],
        properties: {
          sessionId: { type: "string" },
          userId: { type: "integer" },
          pagePath: { type: "string" },
          pageTitle: { type: "string" },
          entryTime: { type: "string", format: "date-time" },
          scrollDepth: { type: "number" },
          interactions: { type: "integer" },
          referrer: { type: "string" },
        },
      },
      EndPageViewBody: {
        type: "object",
        required: ["exitTime", "duration", "scrollDepth", "interactions"],
        properties: {
          exitTime: { type: "string", format: "date-time" },
          duration: { type: "integer" },
          scrollDepth: { type: "number" },
          interactions: { type: "integer" },
          sessionId: { type: "string" },
          userId: { type: "integer" },
        },
      },
      ActivityLogBody: {
        type: "object",
        required: ["action", "details", "entityType"],
        properties: {
          action: { type: "string" },
          details: { type: "object" },
          entityType: { type: "string" },
          entityId: { type: "integer" },
        },
      },
      WebTrackingEvent: {
        type: "object",
        properties: {
          id: { type: "string" },
          sessionId: { type: "string" },
          type: { type: "string" },
          props: { type: "object", additionalProperties: true },
          trackId: { type: "string" },
          ts: { type: "string", format: "date-time" },
          ua: { type: "string" },
        },
      },
      RevalidateTrackingBody: {
        type: "object",
        required: ["trackId", "token", "userId"],
        properties: { trackId: { type: "string" }, token: { type: "string" }, userId: { type: "integer" } },
      },
      ContactBody: {
        type: "object",
        required: ["fullName", "email", "phone", "enquiryType", "message"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          enquiryType: { type: "string" },
          message: { type: "string", minLength: 10 },
        },
      },
    },
    responses: {
      BadRequest: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      Unauthorized: { description: "Missing or invalid auth", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      RateLimited: { description: "Rate limit exceeded", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
    },
  },
  "x-endpoint-count": Object.values(paths).reduce((n, p) => n + Object.keys(p).length, 0),
};

writeFileSync(OUT, JSON.stringify(spec, null, 2));
console.log(`Wrote ${OUT} (${spec["x-endpoint-count"]} operations, ${Object.keys(paths).length} paths)`);
