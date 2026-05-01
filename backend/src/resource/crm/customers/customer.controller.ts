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

export class CustomerProfileController {
  private profileService: CustomerProfileService;
  private corporateKycService: CorporateKycService;
  private corporateKycAttachmentsRepo: CorporateKycAttachmentsRepo;
  private manageAccountsService: CustomerManageAccountsService;
  constructor() {
    const repo = new CustomerProfileRepo();
    this.profileService = new CustomerProfileService(repo);
    this.corporateKycService = new CorporateKycService(new CorporateKycRepo());
    this.corporateKycAttachmentsRepo = new CorporateKycAttachmentsRepo();
    this.manageAccountsService = new CustomerManageAccountsService();
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

    const TTL_72_HOURS = 72 * 60 * 60;
    const kycDataStoreId = corporateKyc.id;
    const cachedKey = `KRA_CORP:${customerId}-${kycDataStoreId}-RUNNER`;
    const runner = await cacheStorage.get<string>(cachedKey);
    if (runner) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "KRA process is already running for this corporate customer.",
      });
      return;
    }

    await cacheStorage.set(cachedKey, new Date().toISOString(), TTL_72_HOURS);
    await kraWorkerQueue.add(
      {
        kraType: "CORPORATE",
        customerId,
        kycDataStoreId,
        stage: "ENQUIRY_KRA",
      },
      { attempts: 1, delay: 0 },
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
