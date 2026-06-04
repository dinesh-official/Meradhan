import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { CustomerProfileRepo } from "./customer.repo";
import { CustomerProfileService } from "./customer.service";
import { CorporateKycRepo } from "./corporatekyc.repo";
import { CorporateKycService } from "./corporatekyc.service";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { cacheStorage } from "@store/redis_store";
import { kraWorkerQueue } from "@jobs/queue/worker_queues";
import { CorporateKycAttachmentsRepo } from "./corporatekyc_attachments.repo";
import z from "zod";
import { CustomerManageAccountsService } from "@resource/customer/profile/customer.manage_accounts.service";
import { db } from "@core/database/database";
import {
  buildCorporateKraFieldMap,
  buildCorporateKraPayload,
  validateCorporateKycForKra,
  type CorporateKycInputForKra,
} from "@jobs/kra_worker/corporateKraPayload";
import {
  decodeKycStatus,
  decodeRejectionReason,
  NDML_CODE_REFERENCE,
} from "@jobs/kra_worker/kraCodes";
import { buildKraNonIndividualAppReqRootXml } from "kyc-providers";
import { env } from "@packages/config/env";
import { CorporateKraDownloadService } from "@jobs/kra_worker/corporateKraDownload.service";

export class CustomerProfileController {
  private profileService: CustomerProfileService;
  private corporateKycService: CorporateKycService;
  private corporateKycAttachmentsRepo: CorporateKycAttachmentsRepo;
  private manageAccountsService: CustomerManageAccountsService;
  private corporateKraDownloadService: CorporateKraDownloadService;
  constructor() {
    const repo = new CustomerProfileRepo();
    this.profileService = new CustomerProfileService(repo);
    this.corporateKycService = new CorporateKycService(new CorporateKycRepo());
    this.corporateKycAttachmentsRepo = new CorporateKycAttachmentsRepo();
    this.manageAccountsService = new CustomerManageAccountsService();
    this.corporateKraDownloadService = new CorporateKraDownloadService();
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    const id = req.session?.id;
    const payload = appSchema.customer.createNewCustomerSchema.parse(req.body);
    const response = await this.profileService.createCustomerProfile(
      payload,
      id
    );

    // Create Audit Log
    await createCrmActivityLog(req, {
      action: "create",
      details: {
        Reason: "CUSTOMER_CREATE",
        Name: `${response.firstName} ${response.middleName} ${response.lastName}`,
        UserName: response.userName,
      },
      entityType: "CUSTOMER",
      entityId: response.id,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const response = await this.profileService.removeCustomerProfile(
      Number(customerId)
    );

    // Create Audit Log
    await createCrmActivityLog(req, {
      action: "delete",
      details: {
        Reason: "CUSTOMER_DELETE",
        Name: `${response.firstName} ${response.middleName} ${response.lastName}`,
        UserName: response.userName,
      },
      entityType: "CUSTOMER_DELETE",
      entityId: response.id,
      userId: Number(req.session?.id),
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async softDeleteCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const response = await this.profileService.softDeleteCustomerProfile(
      Number(customerId)
    );

    // Create Audit Log
    await createCrmActivityLog(req, {
      action: "delete",
      details: {
        Reason: "CUSTOMER_SOFT_DELETE",
        Name: `${response.firstName} ${response.middleName} ${response.lastName}`,
        UserName: response.userName,
      },
      entityType: "CUSTOMER_SOFT_DELETE",
      entityId: response.id,
      userId: Number(req.session?.id),
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const payload = appSchema.customer.updateCustomerProfileSchema.parse(
      req.body
    );
    const response = await this.profileService.updateCustomerProfile(
      Number(customerId),
      payload
    );
    // Create Audit Log
    await createCrmActivityLog(req, {
      action: "update",
      details: {
        Reason: "CUSTOMER_UPDATE",
        Name: `${response.firstName} ${response.middleName} ${response.lastName}`,
        UserName: response.userName,
      },
      entityType: "CUSTOMER",
      entityId: response.id,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async filterCustomer(req: Request, res: Response): Promise<void> {
    const payload = appSchema.customer.findManyCustomerSchema.parse(req.query);
    const response = await this.profileService.filterCustomers(payload);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const response = await this.profileService.getCustomerProfile(
      Number(customerId)
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getFullProfileCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;

    const response = await this.profileService.getFullCustomerProfile(
      Number(customerId)
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getCorporateKyc(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const response = await this.corporateKycService.getByCustomerId(
      Number(customerId)
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async downloadCorporateKycPdf(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    if (Number.isNaN(customerId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id",
      });
      return;
    }
    try {
      const { buffer, filename } =
        await this.profileService.getCorporatePdf(customerId);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      console.error("Corporate KYC PDF failed:", err);
      if (err instanceof AppError && err.statusCode === HttpStatus.NOT_FOUND) {
        res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: err.message,
        });
        return;
      }
      res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          err instanceof Error ? err.message : "Failed to generate corporate KYC PDF",
      });
    }
  }

  async saveCorporateKyc(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const payload = appSchema.customer.createCorporateKycSchema.parse(req.body);
    const response = await this.corporateKycService.save(
      Number(customerId),
      payload
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  /**
   * CRM action: forcibly finish a running corporate KRA process.
   *
   * Cleans up the persistence (Redis runner + retry counter), drains any
   * pending Bull jobs scheduled for this `(customerId, kycDataStoreId)`,
   * appends a `MANUAL_FINISHED` log entry, and (if not already VERIFIED)
   * updates `kraStatus = "MANUAL_FINISHED"` so the operator can
   * re-trigger KRA. The button on the CRM page becomes enabled again
   * because `corporateKraStatus.isRunning` flips to false on the next poll.
   */
  async finishCorporateKra(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    if (Number.isNaN(customerId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id",
      });
      return;
    }

    const corporateKyc = await this.corporateKycService.getByCustomerId(customerId);
    if (!corporateKyc) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Corporate KYC data not found.",
      });
      return;
    }

    const kycDataStoreId = corporateKyc.id;
    const runnerKey = `KRA_CORP:${customerId}-${kycDataStoreId}-RUNNER`;
    const retryKey = `KRA_CORP:${customerId}-${kycDataStoreId}-RETRY`;

    // Drain any pending Bull jobs targeting this customer/kyc.
    // We can only safely remove delayed + waiting; active jobs are mid-processing
    // and the worker's runnerKey check (cleared below) will short-circuit them.
    let removedJobIds: Array<string | number> = [];
    try {
      const [delayed, waiting] = await Promise.all([
        kraWorkerQueue.getDelayed(),
        kraWorkerQueue.getWaiting(),
      ]);
      const targets = [...delayed, ...waiting].filter((job) => {
        const d = (job?.data ?? {}) as {
          kraType?: string;
          customerId?: number;
          kycDataStoreId?: number;
        };
        return (
          d.kraType === "CORPORATE" &&
          Number(d.customerId) === customerId &&
          Number(d.kycDataStoreId) === kycDataStoreId
        );
      });
      for (const job of targets) {
        try {
          await job.remove();
          removedJobIds.push(job.id as string | number);
        } catch {
          // best-effort drain — keep going
        }
      }
    } catch (err) {
      console.error("finishCorporateKra: failed to drain queue", err);
    }

    await cacheStorage.delete(runnerKey);
    await cacheStorage.delete(retryKey);

    const crmUserId =
      typeof (req.session as { id?: unknown } | undefined)?.id === "number"
        ? ((req.session as { id: number }).id as number)
        : null;

    const nowIso = new Date().toISOString();
    await db.dataBase.kraDataLogs.create({
      data: {
        userId: customerId,
        kycId: kycDataStoreId,
        stage: "MANUAL_FINISHED_BY_CRM",
        requestData: { customerId, kycDataStoreId, crmUserId } as object,
        responseData: {
          message: "Corporate KRA process manually finished by CRM.",
          removedJobIds,
        } as object,
        reqTime: nowIso,
        resTime: nowIso,
      },
    });

    // Only flip kraStatus if it isn't already VERIFIED — we don't want to
    // downgrade a successfully verified customer.
    const customer = await this.profileService.getCustomerProfile(customerId);
    const currentStatus = String(customer?.kraStatus ?? "").trim().toUpperCase();
    if (currentStatus !== "VERIFIED") {
      await db.dataBase.customerProfileDataModel.update({
        where: { id: customerId },
        data: { kraStatus: "MANUAL_FINISHED" },
      });
    }

    await createCrmActivityLog(req, {
      action: "update",
      details: {
        Reason: "CORPORATE_KRA_MANUAL_FINISH",
        customerId,
        kycDataStoreId,
        removedJobIds,
        priorStatus: customer?.kraStatus ?? null,
      },
      entityType: "CUSTOMER",
      entityId: customerId,
      userId: Number(req.session?.id),
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { isFinished: true, removedJobIds },
      message: "Corporate KRA process finished.",
    });
  }

  /**
   * Build a *preview* of the exact NDML Non-Individual KRA payload that
   * `CorporateKraWorkerService` would send for this customer, together with
   * a validation report and a row-by-row source → XML mapping the CRM page
   * can render. No SOAP call is made.
   */
  async corporateKraPreview(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    if (Number.isNaN(customerId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id",
      });
      return;
    }

    const corporateKyc = await db.dataBase.corporateKycModel.findUnique({
      where: { customerProfileDataModelId: customerId },
      include: {
        authorisedSignatories: true,
        directors: true,
        promoters: true,
      },
    });

    if (!corporateKyc) {
      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: {
          hasCorporateKyc: false,
          isRunning: false,
          kycDataStoreId: null,
        },
      });
      return;
    }

    const input: CorporateKycInputForKra = {
      id: corporateKyc.id,
      entityName: corporateKyc.entityName,
      dateOfIncorporation: corporateKyc.dateOfIncorporation,
      dateOfCommencementOfBusiness: corporateKyc.dateOfCommencementOfBusiness,
      countryOfIncorporation: corporateKyc.countryOfIncorporation,
      placeOfIncorporation: corporateKyc.placeOfIncorporation,
      panNumber: corporateKyc.panNumber,
      cinOrRegistrationNumber: corporateKyc.cinOrRegistrationNumber,
      entityConstitutionType: corporateKyc.entityConstitutionType,
      annualIncome: corporateKyc.annualIncome,
      fatcaApplicable: corporateKyc.fatcaApplicable,
      correspondenceLine1: corporateKyc.correspondenceLine1,
      correspondenceLine2: corporateKyc.correspondenceLine2,
      correspondenceLine3: corporateKyc.correspondenceLine3,
      correspondenceCity: corporateKyc.correspondenceCity,
      correspondencePinCode: corporateKyc.correspondencePinCode,
      correspondenceState: corporateKyc.correspondenceState,
      correspondenceAddressProofType: corporateKyc.correspondenceAddressProofType,
      registeredLine1: corporateKyc.registeredLine1,
      registeredLine2: corporateKyc.registeredLine2,
      registeredLine3: corporateKyc.registeredLine3,
      registeredCity: corporateKyc.registeredCity,
      registeredPinCode: corporateKyc.registeredPinCode,
      registeredState: corporateKyc.registeredState,
      registeredAddressProofType: corporateKyc.registeredAddressProofType,
      authorisedSignatories: corporateKyc.authorisedSignatories,
      directors: corporateKyc.directors,
      promoters: corporateKyc.promoters,
    };

    const built = buildCorporateKraPayload(input);
    const fieldMap = buildCorporateKraFieldMap(input, built);
    const issues = validateCorporateKycForKra(input);

    // ── Build the exact XML the SDK would send to NDML, with credentials
    //    masked so it is safe to render in the CRM UI. ───────────────────
    const innerXml = buildKraNonIndividualAppReqRootXml(built.payload);
    const MASK = "***";
    const userName = env.KRA_USERNAME;
    const okraCdOrMiId = env.KRA_OKRA_CD_MI_ID;

    const registerByteArray = Array.from(Buffer.from(innerXml, "utf8"));
    const soapRegisterXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:com="http://common.nsdl.com">
  <soapenv:Header/>
  <soapenv:Body>
    <com:registration>
      ${registerByteArray.map((r) => `<input>${r}</input>`).join("")}
      <userId>${userName}</userId>
      <userPassword>${MASK}</userPassword>
      <passKey>${MASK}</passKey>
      <okraCdOrMiId>${okraCdOrMiId}</okraCdOrMiId>
    </com:registration>
  </soapenv:Body>
</soapenv:Envelope>`;

    const soapModifyXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.webservice.pan.kra.ndml.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:processModification>
      <arg0><![CDATA[${innerXml.trim()}]]></arg0>
      <arg1>${userName}</arg1>
      <arg2>${MASK}</arg2>
      <arg3>${MASK}</arg3>
    </ser:processModification>
  </soapenv:Body>
</soapenv:Envelope>`;

    const runnerKey = `KRA_CORP:${customerId}-${corporateKyc.id}-RUNNER`;
    const runner = await cacheStorage.get<string>(runnerKey);

    const lastDownload = await this.corporateKraDownloadService.getLastManualDownload(customerId);

    const recentLogs = await db.dataBase.kraDataLogs.findMany({
      where: { userId: customerId, kycId: corporateKyc.id },
      orderBy: { id: "desc" },
      take: 25,
    });

    // Walk each log's `responseData` and pull out any NDML status / error codes
    // we can decode into plain English for the CRM UI.
    const annotatedLogs = recentLogs.map((l) => {
      const decoded: Array<{ field: string; code: string; label?: string }> = [];
      const collect = (node: unknown, path: string) => {
        if (node == null) return;
        if (typeof node !== "object") return;
        if (Array.isArray(node)) {
          node.forEach((item, i) => collect(item, `${path}[${i}]`));
          return;
        }
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
          const nextPath = path ? `${path}.${key}` : key;
          if (typeof value === "string" || typeof value === "number") {
            const v = String(value).trim();
            if (!v) continue;
            if (key === "APP_STATUS" || key === "APP_ADDLDATA_STATUS") {
              const label = decodeKycStatus(v);
              if (label) decoded.push({ field: nextPath, code: v, label });
            } else if (key === "APP_ERROR_DESC" || key === "APP_ADDLDATA_ERROR_DESC") {
              const label = decodeRejectionReason(v);
              if (label) decoded.push({ field: nextPath, code: v, label });
            }
          } else if (typeof value === "object") {
            collect(value, nextPath);
          }
        }
      };
      collect(l.responseData, "");
      return { ...l, decoded };
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        hasCorporateKyc: true,
        kycDataStoreId: corporateKyc.id,
        isRunning: Boolean(runner),
        runnerStartedAt: runner ?? null,
        kraStatus: (await db.dataBase.customerProfileDataModel.findUnique({
          where: { id: customerId },
          select: { kraStatus: true, kycStatus: true, verifyDate: true },
        })) ?? null,
        validation: {
          errors: issues.filter((i) => i.severity === "ERROR"),
          warnings: issues.filter((i) => i.severity === "WARN"),
          canTrigger: issues.every((i) => i.severity !== "ERROR"),
        },
        mapping: {
          fields: fieldMap,
          notes: built.mappingNotes,
        },
        payload: built.payload,
        xml: {
          inner: innerXml,
          soapRegister: soapRegisterXml,
          soapModify: soapModifyXml,
          credentialsMasked: true,
          soapAction: {
            register: "registration",
            modify: "processModification",
          },
        },
        codeReference: NDML_CODE_REFERENCE,
        lastDownload: lastDownload
          ? {
              logId: lastDownload.id,
              kycId: lastDownload.kycId,
              storedAt: (lastDownload.resTime ?? lastDownload.reqTime ?? new Date()).toISOString(),
              summary: lastDownload.summary,
              request: lastDownload.requestData,
              response: lastDownload.responseData,
            }
          : null,
        recentLogs: annotatedLogs,
      },
    });
  }

  /**
   * Manually trigger a single corporate KRA download for this customer.
   *
   *   - Loads the corporate KYC.
   *   - Calls NDML's `nonIndividualPanDownloadDetailsComplete` with the PAN +
   *     DOI from the corporate KYC and the configured KRA mobile.
   *   - Writes a `kraDataLogs` row with stage = `CORPORATE_MANUAL_DOWNLOAD`
   *     (or `..._FAILED` on error so operators still have a trail).
   *
   * Does NOT touch `kraStatus` or enqueue the worker — this is purely a
   * "fetch & remember" operation for the CRM "KRA preview" page.
   */
  async corporateKraDownload(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    if (Number.isNaN(customerId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id",
      });
      return;
    }

    try {
      const result = await this.corporateKraDownloadService.downloadOnce(customerId);

      await createCrmActivityLog(req, {
        action: "create",
        details: {
          Reason: "CORPORATE_KRA_MANUAL_DOWNLOAD",
          CustomerId: String(customerId),
          KraLogId: String(result.logId),
          NdmlStatus: result.summary.status.label ?? result.summary.status.code ?? "",
        },
        entityType: "CUSTOMER",
        entityId: customerId,
        userId: Number(req.session?.id),
      });

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (err) {
      if (err instanceof AppError) {
        res.sendResponse({ statusCode: err.statusCode, message: err.message });
        return;
      }
      console.error("Corporate KRA manual download failed:", err);
      res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          err instanceof Error
            ? err.message
            : "Failed to download corporate KRA data",
      });
    }
  }

  async corporateKraStatus(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    if (Number.isNaN(customerId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id",
      });
      return;
    }

    const corporateKyc = await this.corporateKycService.getByCustomerId(customerId);
    const kycDataStoreId = corporateKyc?.id ?? null;
    if (!kycDataStoreId) {
      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: { isRunning: false, kycDataStoreId: null },
      });
      return;
    }

    const cachedKey = `KRA_CORP:${customerId}-${kycDataStoreId}-RUNNER`;
    const runner = await cacheStorage.get<string>(cachedKey);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { isRunning: Boolean(runner), kycDataStoreId },
    });
  }

  async triggerCorporateKra(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    if (Number.isNaN(customerId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id",
      });
      return;
    }

    const corporateKyc = await this.corporateKycService.getByCustomerId(customerId);
    if (!corporateKyc) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Corporate KYC data not found. Please save corporate KYC first.",
      });
      return;
    }

    const missing: string[] = [];
    const pan = (corporateKyc as any).panNumber ?? (corporateKyc as any).pan ?? null;
    if (!pan) missing.push("PAN");

    const doi =
      (corporateKyc as any).dateOfIncorporation ??
      (corporateKyc as any).incorporationDate ??
      (corporateKyc as any).commencementDate ??
      null;
    if (!doi) missing.push("Date of incorporation/commencement");

    const authorisedSignatories = (corporateKyc as any).authorisedSignatories ?? [];
    if (!Array.isArray(authorisedSignatories) || authorisedSignatories.length === 0) {
      missing.push("At least 1 authorised signatory");
    } else {
      const first = authorisedSignatories[0] ?? {};
      if (!first?.email) missing.push("Authorised signatory email");
      if (!first?.mobile) missing.push("Authorised signatory mobile");
    }

    if (missing.length > 0) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Missing required corporate KYC data: ${missing.join(", ")}`,
      });
      return;
    }

    const { pastExecution, delayMs = 0 } =
      appSchema.customer.triggerCorporateKraSchema.parse(req.body ?? {});

    const TTL_72_HOURS = 72 * 60 * 60;
    const kycDataStoreId = corporateKyc.id;
    const runnerKey = `KRA_CORP:${customerId}-${kycDataStoreId}-RUNNER`;
    const lastTaskKey = `KRA_CORP:${customerId}-${kycDataStoreId}`;
    const runner = await cacheStorage.get<string>(runnerKey);
    if (runner) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "KRA process is already running for this corporate customer.",
      });
      return;
    }

    if (pastExecution === "NONE") {
      await cacheStorage.delete(lastTaskKey);
    } else {
      const cacheValue =
        pastExecution === "CBRICS_ONLY" ? "MODIFY" : pastExecution;
      await cacheStorage.set(lastTaskKey, cacheValue, TTL_72_HOURS);
    }

    await cacheStorage.set(runnerKey, new Date().toISOString(), TTL_72_HOURS);
    await kraWorkerQueue.add(
      {
        kraType: "CORPORATE",
        customerId,
        kycDataStoreId,
        stage: "ENQUIRY_KRA",
        ...(pastExecution === "CBRICS_ONLY" ? { cbricsOnly: true } : {}),
      },
      { attempts: 1, delay: delayMs },
    );

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Corporate KRA triggered successfully.",
      responseData: { isTriggered: true },
    });
  }

  async listCorporateKycAttachments(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    if (Number.isNaN(customerId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id",
      });
      return;
    }

    const corporateKyc = await this.corporateKycService.getByCustomerId(customerId);
    if (!corporateKyc) {
      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: [],
      });
      return;
    }

    const items = await this.corporateKycAttachmentsRepo.listByCorporateKycId(corporateKyc.id);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: items,
    });
  }

  async createCorporateKycAttachment(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    if (Number.isNaN(customerId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id",
      });
      return;
    }

    const corporateKyc = await this.corporateKycService.getByCustomerId(customerId);
    if (!corporateKyc) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Corporate KYC data not found. Please save corporate KYC first.",
      });
      return;
    }

    const payload = z
      .object({
        label: z.string().trim().min(1, "Label is required"),
        fileUrl: z.string().trim().min(1, "File URL is required"),
      })
      .parse(req.body);

    const createdByCrmUserId =
      typeof (req.session as { id?: unknown } | undefined)?.id === "number"
        ? ((req.session as { id: number }).id as number)
        : undefined;

    const created = await this.corporateKycAttachmentsRepo.create({
      corporateKycModelId: corporateKyc.id,
      label: payload.label,
      fileUrl: payload.fileUrl,
      createdByCrmUserId,
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: created,
      message: "Attachment saved successfully",
    });
  }

  async deleteCorporateKycAttachment(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    const attachmentId = Number(req.params.attachmentId);
    if (Number.isNaN(customerId) || Number.isNaN(attachmentId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id or attachment id",
      });
      return;
    }

    const corporateKyc = await this.corporateKycService.getByCustomerId(customerId);
    if (!corporateKyc) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Corporate KYC data not found. Please save corporate KYC first.",
      });
      return;
    }

    const deleted = await this.corporateKycAttachmentsRepo.deleteById({
      corporateKycModelId: corporateKyc.id,
      attachmentId,
    });
    if (!deleted) {
      res.sendResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Attachment not found",
      });
      return;
    }

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { isDeleted: true },
      message: "Attachment deleted successfully",
    });
  }

  async crmSetPrimaryBankAccount(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    const bankAccountId = Number(req.params.bankAccountId);
    if (Number.isNaN(customerId) || Number.isNaN(bankAccountId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id or bank account id",
      });
      return;
    }

    const customer = await this.profileService.getCustomerProfile(customerId);
    if (String(customer?.kraStatus ?? "").trim().toUpperCase() !== "VERIFIED") {
      res.sendResponse({
        statusCode: HttpStatus.FORBIDDEN,
        message: "KRA is not completed for this customer. Complete KRA first, then set default accounts.",
      });
      return;
    }

    await this.manageAccountsService.setPrimaryBankAccount(customerId, bankAccountId);
    await createCrmActivityLog(req, {
      action: "update",
      details: {
        Reason: "CRM_SET_PRIMARY_BANK_ACCOUNT",
        customerId,
        bankAccountId,
      },
      entityType: "CUSTOMER",
      entityId: customerId,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { success: true },
      message: "Primary bank account set successfully.",
    });
  }

  async crmSetPrimaryDematAccount(req: Request, res: Response): Promise<void> {
    const customerId = Number(req.params.customerId);
    const dematAccountId = Number(req.params.dematAccountId);
    if (Number.isNaN(customerId) || Number.isNaN(dematAccountId)) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid customer id or demat account id",
      });
      return;
    }

    const customer = await this.profileService.getCustomerProfile(customerId);
    if (String(customer?.kraStatus ?? "").trim().toUpperCase() !== "VERIFIED") {
      res.sendResponse({
        statusCode: HttpStatus.FORBIDDEN,
        message: "KRA is not completed for this customer. Complete KRA first, then set default accounts.",
      });
      return;
    }

    await this.manageAccountsService.setPrimaryDematAccount(customerId, dematAccountId);
    await createCrmActivityLog(req, {
      action: "update",
      details: {
        Reason: "CRM_SET_PRIMARY_DEMAT_ACCOUNT",
        customerId,
        dematAccountId,
      },
      entityType: "CUSTOMER",
      entityId: customerId,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { success: true },
      message: "Primary demat account set successfully.",
    });
  }

  async getCustomerByParticipantCode(req: Request, res: Response): Promise<void> {
    const participantCode = req.params.participantCode;
    if (!participantCode) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Participant code is required",
      });
      return;
    }
    const response = await this.profileService.getCustomerByParticipantCode(participantCode as string);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }
}
