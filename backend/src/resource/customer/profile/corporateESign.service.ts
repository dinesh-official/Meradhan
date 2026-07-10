/**
 * Customer-facing corporate KYC e-sign service.
 *
 * The CRM operator creates `CorporateESignRequestModel` rows (via the
 * existing `/crm/.../e-sign-requests` POST). This service is what the
 * meradhan customer hits to actually sign those documents through Digio:
 *
 *   1. `listPendingForCustomer` powers the dashboard banner — "you have
 *      N e-sign requests waiting".
 *   2. `getByIdForCustomer` is the per-request detail used by the 2-step
 *      sign page (`/dashboard/corporate-kyc/e-sign/[requestId]`).
 *   3. `kickOffDigio` ensures a source PDF exists (downloads an operator-
 *      uploaded file or calls pdf-service `POST /api/corporate/pdf` with
 *      saved CRM payload + customer risk profile), hands it to Digio's
 *      `esignRequest`, persists the returned doc id / access-token id, and
 *      returns the iframe handoff payload.
 *   4. `verifyDigio` is called after the meradhan iframe success
 *      callback. It pulls the signed PDF from Digio, persists it to S3,
 *      and flips the row to COMPLETED.
 *
 * All four methods enforce ownership via the
 * `CorporateKycModel.customerProfileDataModelId` join, so a customer can
 * never read or sign another customer's e-sign request.
 */

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { db } from "@core/database/database";
import { saveFileOnCloud } from "@modules/file_upload/helpers/save_file_on_cloud";
import { env } from "@packages/config/src/env";
import { CorporateKycRepo } from "@resource/crm/customers/corporatekyc.repo";
import { CorporateKycService } from "@resource/crm/customers/corporatekyc.service";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { makeFullname } from "@utils/generate/generate_username";
import axios from "axios";
import * as fs from "fs";
import {
  DigioSDK,
  generateCorporatePdfFromServicePayload,
  getPdfPageCount,
  isCorporateRiskProfileCompleteForPdf,
  normalizeCorporateRiskProfileAnswers,
  prepareCorporatePdfServicePayloadForEsign,
} from "kyc-providers";
import os from "os";
import * as path from "path";
import { Readable } from "stream";

/**
 * Shared S3 client used to fetch the operator-uploaded PDF straight by Key
 * (the value stored in `eSignDocumentUrl` is the S3 key with a leading `/`,
 * not a full HTTPS URL — see `putFileS3` which returns `/{year}/{dir}/...`).
 * Mirrors the config used by `backend/src/resource/common/routes.ts`.
 */
const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

/**
 * Pulls the bytes for an `eSignDocumentUrl` value. Handles all three shapes
 * the CRM can put in that column:
 *   - S3 key (most common): `/2026/corporate-kyc/e-sign/1781...-file.pdf`
 *   - Bare S3 key without leading slash
 *   - Absolute HTTPS URL (when the CRM persisted a presigned/proxy URL)
 */
async function downloadESignSourcePdf(eSignDocumentUrl: string): Promise<Buffer> {
  const isAbsolute = /^https?:\/\//i.test(eSignDocumentUrl);
  if (isAbsolute) {
    const { data } = await axios.get<ArrayBuffer>(eSignDocumentUrl, {
      responseType: "arraybuffer",
      timeout: 30_000,
    });
    return Buffer.from(data);
  }

  // Treat as an S3 Key. Strip the leading slash `putFileS3` writes in.
  const key = eSignDocumentUrl.replace(/^\/+/, "");
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    }),
  );
  const body = response.Body;
  if (!body) {
    throw new Error("S3 returned an empty body for the source PDF.");
  }

  // The SDK gives us a Node `Readable` in Node runtimes; drain it into a
  // buffer so the caller can hand it to Digio (which needs a real file
  // path) without dealing with streaming semantics.
  if (body instanceof Readable) {
    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      body.on("data", (chunk) =>
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk)),
      );
      body.once("end", () => resolve(Buffer.concat(chunks)));
      body.once("error", reject);
    });
  }
  // Fallback for runtimes that hand back a web stream / Uint8Array (e.g.
  // when the SDK falls back to `fetch`). `transformToByteArray` is on the
  // SDK's mixin type — guard it so TS stays happy.
  const maybeBytes = (
    body as { transformToByteArray?: () => Promise<Uint8Array> }
  ).transformToByteArray;
  if (typeof maybeBytes === "function") {
    return Buffer.from(await maybeBytes.call(body));
  }
  throw new Error("S3 response body had no readable interface.");
}

/** Backend-generated e-sign PDFs (pdf-service output). These are regenerated on each sign attempt so risk profile stays current. */
function isBackendGeneratedESignPdf(eSignDocumentUrl: string): boolean {
  const normalized = eSignDocumentUrl.replace(/^\/+/, "").toLowerCase();
  return normalized.includes("corporate-kyc/e-sign/generated");
}

/**
 * CRM operator uploads land under `corporate-kyc/e-sign/` but not `.../generated/`.
 * Those are signed as-is; only auto-generated rows are refreshed via pdf-service.
 */
function shouldUseExistingESignPdf(eSignDocumentUrl: string | null | undefined): boolean {
  if (!eSignDocumentUrl?.trim()) return false;
  return !isBackendGeneratedESignPdf(eSignDocumentUrl);
}

export class CustomerCorporateESignService {
  private digio = new DigioSDK();
  private corporateKycService = new CorporateKycService(new CorporateKycRepo());

  /**
   * Returns the PENDING corporate e-sign requests for the given customer.
   * Joins via `CorporateKycModel.customerProfileDataModelId` so a customer
   * only ever sees their own requests.
   */
  async listPendingForCustomer(userId: number) {
    return db.dataBase.corporateESignRequestModel.findMany({
      where: {
        status: "PENDING",
        corporateKycModel: { customerProfileDataModelId: userId },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetches a single e-sign request for the given customer with an
   * ownership guard baked into the query. Returns `null` (rather than
   * throwing) so the controller can decide between 404 vs 403.
   */
  async getByIdForCustomer(userId: number, requestId: number) {
    return db.dataBase.corporateESignRequestModel.findFirst({
      where: {
        id: requestId,
        corporateKycModel: { customerProfileDataModelId: userId },
      },
    });
  }

  /**
   * Ensures the request has a source PDF URL. When the CRM created the row
   * without an upload, generates the 19-page corporate KYC PDF via the
   * external pdf-service (`POST /api/corporate/pdf`), using CRM
   * `lastPdfPayload` when saved (or mapping from KYC), with risk profile
   * tier taken from the customer's questionnaire answers at sign time.
   */
  async ensureESignSourcePdf(userId: number, requestId: number) {
    const request = await this.getByIdForCustomer(userId, requestId);
    if (!request) {
      throw new AppError("E-sign request not found.", {
        code: "CORP_ESIGN_NOT_FOUND",
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (shouldUseExistingESignPdf(request.eSignDocumentUrl)) {
      return request;
    }

    const kyc = await this.corporateKycService.getByCustomerId(userId);
    if (!kyc) {
      throw new AppError(
        "Corporate KYC data is required before generating the e-sign document.",
        {
          code: "CORP_ESIGN_NO_KYC",
          statusCode: HttpStatus.BAD_REQUEST,
        },
      );
    }

    const profile = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        userName: true,
        emailAddress: true,
        phoneNo: true,
        riskProfile: {
          select: { data: true },
        },
      },
    });

    const riskAnswers = normalizeCorporateRiskProfileAnswers(
      profile?.riskProfile?.data ?? [],
    );

    if (!isCorporateRiskProfileCompleteForPdf(riskAnswers)) {
      throw new AppError(
        "Please complete all corporate risk profile questions before signing.",
        {
          code: "CORP_ESIGN_RISK_PROFILE_INCOMPLETE",
          statusCode: HttpStatus.BAD_REQUEST,
        },
      );
    }

    const customerForPdf = profile
      ? {
          userName: profile.userName ?? undefined,
          emailAddress: profile.emailAddress ?? undefined,
          phoneNo: profile.phoneNo ?? "",
        }
      : null;

    const payload = prepareCorporatePdfServicePayloadForEsign({
      kyc,
      customer: customerForPdf,
      savedPayload:
        kyc.lastPdfPayload != null &&
        typeof kyc.lastPdfPayload === "object" &&
        !Array.isArray(kyc.lastPdfPayload)
          ? (kyc.lastPdfPayload as Record<string, unknown>)
          : null,
      riskAnswers,
    });

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateCorporatePdfFromServicePayload(payload, {
        serviceUrl: env.CORPORATE_PDF_SERVICE_URL,
      });
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "PDF service request failed";
      throw new AppError(
        `Could not generate corporate KYC PDF: ${detail}`,
        {
          code: "CORP_ESIGN_PDF_GENERATION_FAILED",
          statusCode: HttpStatus.BAD_GATEWAY,
        },
      );
    }
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "corp-esign-gen-"),
    );
    const tempFile = path.join(tempDir, `generated-${requestId}.pdf`);
    try {
      fs.writeFileSync(tempFile, pdfBuffer);
      const generatedUrl = await saveFileOnCloud({
        filePath: tempFile,
        directory: "corporate-kyc/e-sign/generated",
      });

      return db.dataBase.corporateESignRequestModel.update({
        where: { id: requestId },
        data: { eSignDocumentUrl: generatedUrl },
      });
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Best-effort temp cleanup.
      }
    }
  }

  /**
   * Starts a Digio signing session for the given request:
   *
   *   1. Loads the request + customer profile (with ownership guard).
   *   2. Streams the operator-uploaded PDF from S3 into a temp file.
   *   3. Counts the PDF's pages so the `sign_coordinates` Digio expects
   *      match the actual document (the SDK's default is KYC-PDF sized).
   *   4. Calls Digio's `esignRequest` with the logged-in customer's
   *      email + name as the signer.
   *   5. Persists `digioDocumentId` / `digioAccessTokenId` /
   *      `digioRequestedAt` on the row.
   *   6. Returns the iframe handoff payload (entity id + access token id
   *      + signing parties).
   *
   * Safe to retry — each call rotates the access token and overwrites the
   * stored Digio doc id. The row status stays PENDING; only `verifyDigio`
   * flips it to COMPLETED.
   */
  async kickOffDigio(userId: number, requestId: number) {
    const existing = await this.getByIdForCustomer(userId, requestId);

    if (!existing) {
      throw new AppError("E-sign request not found.", {
        code: "CORP_ESIGN_NOT_FOUND",
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (existing.status !== "PENDING") {
      throw new AppError(
        `E-sign request is already ${existing.status}. No further action needed.`,
        {
          code: "CORP_ESIGN_NOT_PENDING",
          statusCode: HttpStatus.BAD_REQUEST,
        },
      );
    }

    const [request, customer] = await Promise.all([
      this.ensureESignSourcePdf(userId, requestId),
      db.dataBase.customerProfileDataModel.findUnique({
        where: { id: userId },
        select: {
          emailAddress: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
      }),
    ]);

    if (!customer?.emailAddress) {
      throw new AppError("Customer email is required to start e-signing.", {
        code: "CORP_ESIGN_NO_EMAIL",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (!request.eSignDocumentUrl) {
      throw new AppError(
        "Source PDF is not available for this e-sign request.",
        {
          code: "CORP_ESIGN_PDF_MISSING",
          statusCode: HttpStatus.BAD_REQUEST,
        },
      );
    }

    // Pull the PDF from S3 (or wherever `eSignDocumentUrl` points) and
    // dump it to a temp file. Digio's SDK expects a real file path it can
    // `fs.readFileSync` — we can't pass a buffer directly. The download
    // helper handles both S3 keys (the common case — `putFileS3` returns
    // `/{year}/...`) and absolute HTTPS URLs (legacy rows).
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "corp-esign-"));
    const tempFile = path.join(tempDir, `request-${requestId}.pdf`);
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await downloadESignSourcePdf(request.eSignDocumentUrl);
      fs.writeFileSync(tempFile, pdfBuffer);
    } catch (err) {
      // Clean up temp dir on download failure to avoid leaking disk.
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup; swallow.
      }
      const detail =
        err instanceof Error ? err.message : "Unknown download error";
      throw new AppError(
        `Could not download the source PDF for e-signing: ${detail}`,
        {
          code: "CORP_ESIGN_PDF_DOWNLOAD_FAILED",
          statusCode: HttpStatus.BAD_GATEWAY,
        },
      );
    }

    try {
      const fullName = makeFullname({
        firstName: customer.firstName ?? "",
        middleName: customer.middleName ?? undefined,
        lastName: customer.lastName ?? undefined,
      }).trim() || "Authorised Signatory";

      const pageCount = Math.max(1, getPdfPageCount(pdfBuffer));

      const digioResponse = await this.digio.esignRequest(tempFile, {
        email: customer.emailAddress,
        name: fullName,
        // The KYC default (44/46) would over-spec sign_coordinates for
        // the operator-uploaded corporate PDF. Pass the actual page count
        // so Digio places a signature on every existing page.
        pageCount,
        reason: "Corporate KYC e-sign",
      });

      const accessTokenId = digioResponse.access_token?.id ?? null;
      const digioDocumentId = digioResponse.id;

      await db.dataBase.corporateESignRequestModel.update({
        where: { id: requestId },
        data: {
          digioDocumentId,
          digioAccessTokenId: accessTokenId,
          digioRequestedAt: new Date(),
        },
      });

      return {
        accessToken: {
          entityId: digioResponse.access_token?.entity_id ?? digioDocumentId,
          id: accessTokenId,
          validTill: digioResponse.access_token?.valid_till ?? null,
        },
        signingParties: digioResponse.signing_parties ?? [],
        documentId: digioDocumentId,
      };
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Best-effort temp cleanup.
      }
    }
  }

  /**
   * Verifies a Digio signing completion: looks up the request by the
   * Digio doc id (which is `@unique` on the model so it doubles as an
   * ownership check), pulls the signed PDF from Digio, persists it to
   * S3, and marks the row COMPLETED.
   *
   * The ownership check is two-layered: we first scope by customer to
   * make sure the caller owns the request, then double-check the doc id
   * matches what we previously persisted on the row.
   */
  async verifyDigio(userId: number, requestId: number, digioDocId: string) {
    const request = await this.getByIdForCustomer(userId, requestId);
    if (!request) {
      throw new AppError("E-sign request not found.", {
        code: "CORP_ESIGN_NOT_FOUND",
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (request.status === "COMPLETED") {
      // Idempotent: if the customer hits verify twice (e.g., react-query
      // retry), return the existing signed URL rather than re-downloading.
      return {
        status: request.status,
        signFileUrl: request.signFileUrl,
        submittedAt: request.submittedAt,
      };
    }

    if (!request.digioDocumentId) {
      throw new AppError(
        "E-sign was never started for this request. Start the Digio flow first.",
        {
          code: "CORP_ESIGN_NOT_STARTED",
          statusCode: HttpStatus.BAD_REQUEST,
        },
      );
    }
    if (request.digioDocumentId !== digioDocId) {
      // The Digio iframe handed us back a doc id that doesn't match the
      // one we issued. Either an old token was used, or someone tampered.
      throw new AppError(
        "Digio document id mismatch — please retry the signing flow.",
        {
          code: "CORP_ESIGN_DIGIO_DOC_MISMATCH",
          statusCode: HttpStatus.BAD_REQUEST,
        },
      );
    }

    // Pull signed PDF bytes from Digio. The SDK returns the raw bytes as
    // a "string" because axios was configured with arraybuffer — we cast
    // to a buffer here to write to disk.
    const signedPdfBytes = (await this.digio.getSignatureEsignPdf(
      digioDocId,
    )) as unknown as Buffer | ArrayBuffer | string;

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "corp-esign-out-"));
    const tempFile = path.join(tempDir, `signed-${requestId}.pdf`);
    try {
      const asBuffer = Buffer.isBuffer(signedPdfBytes)
        ? signedPdfBytes
        : signedPdfBytes instanceof ArrayBuffer
          ? Buffer.from(signedPdfBytes)
          : Buffer.from(signedPdfBytes as string, "binary");
      fs.writeFileSync(tempFile, asBuffer);

      const signedUrl = await saveFileOnCloud({
        filePath: tempFile,
        directory: `corporate-kyc/e-sign/signed`,
      });

      const updated = await db.dataBase.corporateESignRequestModel.update({
        where: { id: requestId },
        data: {
          status: "COMPLETED",
          signFileUrl: signedUrl,
          submittedAt: new Date(),
        },
      });

      return {
        status: updated.status,
        signFileUrl: updated.signFileUrl,
        submittedAt: updated.submittedAt,
      };
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Best-effort temp cleanup.
      }
    }
  }
}
