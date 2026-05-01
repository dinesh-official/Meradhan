import type { UnregisteredParticipantResponse } from "@modules/RFQ/nse/cbrics.types";
import { db, type DataBaseSchema } from "@core/database/database";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type z from "zod";

export type CbricsLinkedCustomerRow = {
  customerId: number;
  displayName: string;
  emailAddress: string;
  phoneNo: string | null;
  userType: string;
  kycStatus: string;
  cbricsParticipantId: number;
  loginId: string;
  workflowStatus: number;
  actualStatus: number;
  participantNameOnCbrics: string;
  panNo: string;
};

/** CBRICS participant workflow codes — display order for grouped lists. */
const WORKFLOW_STATUS_ORDER = [100, 16, 15, 0, 10, 1, 5, 6] as const;

const WORKFLOW_STATUS_LABELS: Record<number, string> = {
  100: "Pending with checker",
  16: "Returned by checker",
  15: "Rejected by checker",
  0: "Pending with exchange",
  10: "Pending with exchange",
  1: "Approved",
  5: "Rejected",
  6: "Returned",
};

export class CbricsManagerDbService {
  private linkedCbricsCustomerWhere(filters: {
    search?: string;
    accountStatus?: "SUSPENDED" | "ACTIVE";
    kycStatus?:
      | "VERIFIED"
      | "PENDING"
      | "REJECTED"
      | "UNDER_REVIEW"
      | "RE_KYC";
  }): DataBaseSchema.CustomerProfileDataModelWhereInput {
    const where: DataBaseSchema.CustomerProfileDataModelWhereInput = {
      isDeleted: false,
      nseDataSet: { isNot: null },
    };

    if (filters.accountStatus) {
      where.utility = {
        accountStatus: { equals: filters.accountStatus },
      };
    }

    if (filters.kycStatus) {
      where.kycStatus = { equals: filters.kycStatus };
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { middleName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { emailAddress: { contains: q, mode: "insensitive" } },
        { userName: { contains: q, mode: "insensitive" } },
        { phoneNo: { contains: q, mode: "insensitive" } },
        { panCard: { panCardNo: { contains: q, mode: "insensitive" } } },
        {
          nseDataSet: {
            participant: {
              loginId: { contains: q, mode: "insensitive" },
            },
          },
        },
        {
          nseDataSet: {
            participant: { panNo: { contains: q, mode: "insensitive" } },
          },
        },
      ];
    }

    return where;
  }

  private mapCustomerRow(r: {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    emailAddress: string;
    phoneNo: string | null;
    userType: string;
    kycStatus: string;
    nseDataSet: {
      participant: {
        id: number;
        loginId: string;
        workflowStatus: number;
        actualStatus: number;
        firstName: string;
        panNo: string;
      };
    } | null;
  }): CbricsLinkedCustomerRow {
    const p = r.nseDataSet!.participant;
    const displayName = [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ").trim();
    return {
      customerId: r.id,
      displayName,
      emailAddress: r.emailAddress,
      phoneNo: r.phoneNo,
      userType: r.userType,
      kycStatus: r.kycStatus,
      cbricsParticipantId: p.id,
      loginId: p.loginId,
      workflowStatus: p.workflowStatus,
      actualStatus: p.actualStatus,
      participantNameOnCbrics: p.firstName,
      panNo: p.panNo,
    };
  }

  /** All linked customers grouped by participant `workflowStatus` (cached NSE state in our DB). */
  async listCustomersWithCbricsGroupedByWorkflow(payload: {
    search?: string;
    accountStatus?: "SUSPENDED" | "ACTIVE";
    kycStatus?: "VERIFIED" | "PENDING" | "REJECTED" | "UNDER_REVIEW" | "RE_KYC";
    maxRows: number;
  }): Promise<{
    groups: Array<{
      workflowStatus: number;
      label: string;
      rows: CbricsLinkedCustomerRow[];
    }>;
    totalReturned: number;
    truncated: boolean;
  }> {
    const cap = Math.min(5000, Math.max(1, payload.maxRows));
    const filters = this.linkedCbricsCustomerWhere({
      search: payload.search,
      accountStatus: payload.accountStatus,
      kycStatus: payload.kycStatus,
    });

    const rows = await db.dataBase.customerProfileDataModel.findMany({
      where: filters,
      take: cap + 1,
      orderBy: { id: "desc" },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        emailAddress: true,
        phoneNo: true,
        userType: true,
        kycStatus: true,
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
                workflowStatus: true,
                actualStatus: true,
                firstName: true,
                panNo: true,
              },
            },
          },
        },
      },
    });

    const truncated = rows.length > cap;
    const slice = truncated ? rows.slice(0, cap) : rows;
    const mapped = slice.map((r) => this.mapCustomerRow(r));

    const byWf = new Map<number, CbricsLinkedCustomerRow[]>();
    for (const row of mapped) {
      const wf = row.workflowStatus;
      const list = byWf.get(wf) ?? [];
      list.push(row);
      byWf.set(wf, list);
    }

    const orderList: number[] = [...WORKFLOW_STATUS_ORDER];
    const seen = [...byWf.keys()];
    const orderedKeys = [
      ...WORKFLOW_STATUS_ORDER.filter((k) => byWf.has(k)),
      ...seen.filter((k) => !orderList.includes(k)).sort((a, b) => a - b),
    ];

    const groups = orderedKeys.map((workflowStatus) => ({
      workflowStatus,
      label: WORKFLOW_STATUS_LABELS[workflowStatus] ?? `Workflow ${workflowStatus}`,
      rows: (byWf.get(workflowStatus) ?? []).sort((a, b) => a.customerId - b.customerId),
    }));

    return { groups, totalReturned: mapped.length, truncated };
  }

  async listCustomersWithCbricsParticipant(
    payload: z.infer<typeof appSchema.customer.findManyCustomerSchema>,
  ): Promise<{
    data: CbricsLinkedCustomerRow[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    const page = Number(payload.page) || 1;
    const pageSize = payload.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const filters = this.linkedCbricsCustomerWhere({
      search: payload.search,
      accountStatus: payload.accountStatus,
      kycStatus: payload.kycStatus,
    });

    const total = await db.dataBase.customerProfileDataModel.count({ where: filters });

    const rows = await db.dataBase.customerProfileDataModel.findMany({
      where: filters,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        emailAddress: true,
        phoneNo: true,
        userType: true,
        kycStatus: true,
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
                workflowStatus: true,
                actualStatus: true,
                firstName: true,
                panNo: true,
              },
            },
          },
        },
      },
    });

    const data: CbricsLinkedCustomerRow[] = rows.map((r) => this.mapCustomerRow(r));

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  /** Normalize IFSC + account number the same way as the CRM UI for matching CBRICS rows to profile banks. */
  static customerBankMatchKey(ifsc: string, accountNumber: string): string {
    const i = (ifsc ?? "").trim().toUpperCase();
    const a = (accountNumber ?? "").replace(/\s/g, "").trim();
    return `${i}|${a}`;
  }

  /**
   * Aligns CBRICS dp lines with `CustomersDematAccountModel` (NSDL uses dpId+benId; CDSL matches on benId).
   * Must stay in sync with CRM `customerDematProfileKey`.
   */
  static customerDematMatchKey(depositoryName: string, dpId: string, clientId: string): string {
    const type = (depositoryName ?? "").trim().toUpperCase();
    const dp = (dpId ?? "").trim();
    const client = (clientId ?? "").replace(/\s/g, "").trim();
    if (type === "CDSL") {
      return `CDSL|${client}`;
    }
    return `NSDL|${dp}|${client}`;
  }

  /**
   * For a CBRICS participant id on `NseCbricsParticipantModel`, load that customer's profile
   * bank and demat rows for comparison with live NSE payload.
   */
  async getCustomerProfileMatchKeysForParticipant(cbricsParticipantId: number): Promise<{
    customerId: number | null;
    bankKeys: string[];
    dematKeys: string[];
  }> {
    const participant = await db.dataBase.nseCbricsParticipantModel.findUnique({
      where: { id: cbricsParticipantId },
      select: { userId: true },
    });
    if (!participant) {
      return { customerId: null, bankKeys: [], dematKeys: [] };
    }

    const [profileBanks, profileDemats] = await Promise.all([
      db.dataBase.customersBankAccountModel.findMany({
        where: { customerProfileDataModelId: participant.userId },
        select: { ifscCode: true, accountNumber: true },
      }),
      db.dataBase.customersDematAccountModel.findMany({
        where: { customerProfileDataModelId: participant.userId },
        select: { depositoryName: true, dpId: true, clientId: true },
      }),
    ]);

    const bankKeys = profileBanks.map((b) =>
      CbricsManagerDbService.customerBankMatchKey(b.ifscCode, b.accountNumber),
    );

    const dematKeys = profileDemats.map((d) =>
      CbricsManagerDbService.customerDematMatchKey(
        String(d.depositoryName),
        d.dpId,
        d.clientId,
      ),
    );

    return { customerId: participant.userId, bankKeys, dematKeys };
  }

  /**
   * Paginated list of every row in `NseCbricsParticipantModel` (synced CBRICS unregistered participants).
   * No filter on CRM KYC, `NseDataSet`, or account status — only optional text/numeric search on this table.
   */
  async listAllNseCbricsParticipants(payload: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{
    data: Array<{
      key: number;
      id: number;
      loginId: string;
      userId: number;
      actualStatus: number;
      workflowStatus: number;
      firstName: string;
      panNo: string;
      contactPerson: string;
      telephone: string;
      emailList: string[];
      createdAt: string;
      updatedAt: string;
    }>;
    meta: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, payload.page);
    const pageSize = Math.min(100, Math.max(1, payload.pageSize));
    const skip = (page - 1) * pageSize;

    const filters: DataBaseSchema.NseCbricsParticipantModelWhereInput = {};
    const rawSearch = payload.search?.trim();

    if (rawSearch) {
      const q = rawSearch;
      const or: DataBaseSchema.NseCbricsParticipantModelWhereInput[] = [
        { loginId: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { panNo: { contains: q, mode: "insensitive" } },
        { contactPerson: { contains: q, mode: "insensitive" } },
      ];
      if (/^\d+$/.test(q)) {
        const n = parseInt(q, 10);
        or.push({ id: n }, { userId: n });
      }
      filters.OR = or;
    }

    const total = await db.dataBase.nseCbricsParticipantModel.count({ where: filters });

    const rows = await db.dataBase.nseCbricsParticipantModel.findMany({
      where: filters,
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
      select: {
        key: true,
        id: true,
        loginId: true,
        userId: true,
        actualStatus: true,
        workflowStatus: true,
        firstName: true,
        panNo: true,
        contactPerson: true,
        telephone: true,
        emailList: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const data = rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  /**
   * CRM-only: for a row in `NseCbricsParticipantModel`, insert missing customer bank/demat profile rows using a live NSE unreg snapshot.
   * Does not use customer self-serve APIs (no KYC gate). Dedup by the same composite keys as the UI match badges.
   */
  async createMissingCustomerProfileFinancials(
    nseParticipantId: number,
    live: UnregisteredParticipantResponse,
  ): Promise<{
    profileId: number;
    createdBanks: number;
    createdDemats: number;
    skippedExistingBankLines: number;
    skippedExistingDematLines: number;
    skippedBankMissingAccountNumber: number;
    skippedDematInvalid: number;
  }> {
    const participant = await db.dataBase.nseCbricsParticipantModel.findUnique({
      where: { id: nseParticipantId },
      select: { userId: true },
    });

    if (!participant) {
      throw new AppError(
        "This CBRICS participant id is not in our database mirror yet (sync/add participant first).",
        { statusCode: HttpStatus.NOT_FOUND, code: "CBRICS_PARTICIPANT_NOT_IN_LOCAL_MIRROR" },
      );
    }

    const profileId = participant.userId;

    const profile = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: profileId, isDeleted: false },
      select: { id: true },
    });
    if (!profile) {
      throw new AppError("Customer profile for this participant was not found or is deleted.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "CUSTOMER_PROFILE_NOT_FOUND",
      });
    }

    const holderFallback =
      [live.firstName, live.contactPerson].find((x) => (x ?? "").trim().length > 0)?.trim() ?? "Customer";
    const panForDemat = (live.panNo ?? "").trim() || "PAN_EXEMPT";

    const [existingBanks, existingDemats] = await Promise.all([
      db.dataBase.customersBankAccountModel.findMany({
        where: { customerProfileDataModelId: profileId },
        select: { ifscCode: true, accountNumber: true },
      }),
      db.dataBase.customersDematAccountModel.findMany({
        where: { customerProfileDataModelId: profileId },
        select: { depositoryName: true, dpId: true, clientId: true },
      }),
    ]);

    const bankKeySet = new Set(
      existingBanks.map((b) => CbricsManagerDbService.customerBankMatchKey(b.ifscCode, b.accountNumber)),
    );
    const dematKeySet = new Set(
      existingDemats.map((d) =>
        CbricsManagerDbService.customerDematMatchKey(String(d.depositoryName), d.dpId, d.clientId),
      ),
    );

    type BankCreate = DataBaseSchema.CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput;
    type DematCreate = DataBaseSchema.CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput;

    const banksToAdd: BankCreate[] = [];
    let skippedExistingBankLines = 0;
    let skippedBankMissingAccountNumber = 0;

    for (const b of live.bankAccountList ?? []) {
      const acct = String(b.bankAccountNo ?? "").replace(/\s/g, "").trim();
      if (!acct) {
        skippedBankMissingAccountNumber += 1;
        continue;
      }
      const ifsc = String(b.bankIFSC ?? "").trim();
      const key = CbricsManagerDbService.customerBankMatchKey(ifsc, acct);
      if (bankKeySet.has(key)) {
        skippedExistingBankLines += 1;
        continue;
      }
      bankKeySet.add(key);
      banksToAdd.push({
        accountHolderName: holderFallback,
        bankAccountType: "SAVING",
        accountNumber: acct,
        ifscCode: ifsc || "--------",
        bankName: String(b.bankName ?? "").trim() || "--------",
        branch: "Synced from CBRICS",
        isPrimary: b.isDefault === "Y",
        isVerified: false,
        allowTerms: false,
      });
    }

    const dematsToAdd: DematCreate[] = [];
    let skippedExistingDematLines = 0;
    let skippedDematInvalid = 0;

    for (const d of live.dpAccountList ?? []) {
      const ben = String(d.benId ?? "").replace(/\s/g, "").trim();
      if (!ben) {
        skippedDematInvalid += 1;
        continue;
      }
      const dpType = String(d.dpType ?? "").toUpperCase() === "CDSL" ? "CDSL" : "NSDL";
      const dpIdRaw = String(d.dpId ?? "").trim();
      if (dpType === "NSDL" && !dpIdRaw) {
        skippedDematInvalid += 1;
        continue;
      }
      const dpIdForRow = dpType === "CDSL" ? "" : dpIdRaw;
      const key = CbricsManagerDbService.customerDematMatchKey(dpType, dpIdForRow, ben);
      if (dematKeySet.has(key)) {
        skippedExistingDematLines += 1;
        continue;
      }
      dematKeySet.add(key);
      dematsToAdd.push({
        depositoryName: dpType,
        dpId: dpIdForRow,
        clientId: ben,
        accountType: "SOLO",
        depositoryParticipantName: "Synced from CBRICS",
        primaryPanNumber: panForDemat,
        sndPanNumber: null,
        trdPanNumber: null,
        accountHolderName: holderFallback,
        isPrimary: d.isDefault === "Y",
        isVerified: false,
        allowTerms: false,
      });
    }

    const result = await db.dataBase.$transaction(async (tx) => {
      let createdBanks = 0;
      let createdDemats = 0;

      if (banksToAdd.some((x) => x.isPrimary)) {
        await tx.customersBankAccountModel.updateMany({
          where: { customerProfileDataModelId: profileId },
          data: { isPrimary: false },
        });
      }
      for (const data of banksToAdd) {
        await tx.customersBankAccountModel.create({
          data: {
            ...data,
            CustomerProfileDataModel: { connect: { id: profileId } },
          },
        });
        createdBanks += 1;
      }

      if (dematsToAdd.some((x) => x.isPrimary)) {
        await tx.customersDematAccountModel.updateMany({
          where: { customerProfileDataModelId: profileId },
          data: { isPrimary: false },
        });
      }
      for (const data of dematsToAdd) {
        await tx.customersDematAccountModel.create({
          data: {
            ...data,
            CustomerProfileDataModel: { connect: { id: profileId } },
          },
        });
        createdDemats += 1;
      }

      return { createdBanks, createdDemats };
    });

    return {
      profileId,
      createdBanks: result.createdBanks,
      createdDemats: result.createdDemats,
      skippedExistingBankLines,
      skippedExistingDematLines,
      skippedBankMissingAccountNumber,
      skippedDematInvalid,
    };
  }
}
