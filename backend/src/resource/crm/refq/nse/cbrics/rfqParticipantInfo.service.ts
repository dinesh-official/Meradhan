/**
 * CRM-private enrichment of NSE RFQ participants.
 *
 * NSE's `/participants/all` only returns `{ code, name }`. Operators want to
 * attach contact, KYC, bank and demat details against each `code` for
 * internal reference (settlement notes, etc.). This service backs the
 * `nse_rfq_participant_info` table plus its child bank / demat tables.
 *
 * Side-effects are deliberately scoped to our DB — nothing here ever calls
 * out to NSE or CBRICS.
 */

import { db } from "@core/database/database";
import type { NseRfqParticipantInfoUpsertBody } from "@root/schema";

/**
 * Shape returned by the `findByCode` / `upsertByCode` reads. Includes the
 * child bank and demat lists so the CRM can render the full form without
 * a second round-trip.
 */
export type NseRfqParticipantInfoRecord = NonNullable<
  Awaited<ReturnType<NseRfqParticipantInfoService["findByCode"]>>
>;

export class NseRfqParticipantInfoService {
  async findByCode(code: string) {
    return await db.dataBase.nseRfqParticipantInfoModel.findUnique({
      where: { code },
      include: {
        bankAccounts: { orderBy: { id: "asc" } },
        dematAccounts: { orderBy: { id: "asc" } },
      },
    });
  }

  /**
   * Replaces the participant info wholesale: scalar fields, bank accounts
   * and demat accounts are all overwritten with the payload's contents.
   * Wrapped in a transaction so a partial update can never leave dangling
   * child rows.
   *
   * The replace-all strategy keeps the surface tiny — the form posts the
   * entire shape on every save and the server doesn't need to diff.
   */
  async upsertByCode(code: string, body: NseRfqParticipantInfoUpsertBody) {
    const scalarFields = {
      nameOverride: body.nameOverride ?? null,
      contactPerson: body.contactPerson ?? null,
      emailList: body.emailList,
      mobileList: body.mobileList,
      telephone: body.telephone ?? null,
      address: body.address ?? null,
      address2: body.address2 ?? null,
      address3: body.address3 ?? null,
      stateCode: body.stateCode ?? null,
      panNo: body.panNo ?? null,
      leiCode: body.leiCode ?? null,
      custodian: body.custodian ?? null,
      dobDoi: body.dobDoi ?? null,
      notes: body.notes ?? null,
    };

    return await db.dataBase.$transaction(async (tx) => {
      const upserted = await tx.nseRfqParticipantInfoModel.upsert({
        where: { code },
        create: {
          code,
          ...scalarFields,
        },
        update: scalarFields,
      });

      // Replace bank accounts wholesale.
      await tx.nseRfqParticipantBankAccountModel.deleteMany({
        where: { participantInfoId: upserted.id },
      });
      if (body.bankAccounts.length > 0) {
        await tx.nseRfqParticipantBankAccountModel.createMany({
          data: body.bankAccounts.map((acc) => ({
            participantInfoId: upserted.id,
            bankName: acc.bankName,
            bankIFSC: acc.bankIFSC,
            bankAccountNo: acc.bankAccountNo,
            isDefault: acc.isDefault,
          })),
        });
      }

      // Replace demat accounts wholesale.
      await tx.nseRfqParticipantDpAccountModel.deleteMany({
        where: { participantInfoId: upserted.id },
      });
      if (body.dematAccounts.length > 0) {
        await tx.nseRfqParticipantDpAccountModel.createMany({
          data: body.dematAccounts.map((acc) => ({
            participantInfoId: upserted.id,
            dpType: acc.dpType,
            dpId: acc.dpId ?? null,
            benId: acc.benId,
            isDefault: acc.isDefault,
          })),
        });
      }

      return await tx.nseRfqParticipantInfoModel.findUniqueOrThrow({
        where: { id: upserted.id },
        include: {
          bankAccounts: { orderBy: { id: "asc" } },
          dematAccounts: { orderBy: { id: "asc" } },
        },
      });
    });
  }

  /**
   * Returns the set of `code`s that already have any saved info. Used by
   * the participants list view to render a "saved info" badge next to
   * rows the operator has already touched.
   */
  async listSavedCodes(): Promise<string[]> {
    const rows = await db.dataBase.nseRfqParticipantInfoModel.findMany({
      select: { code: true },
    });
    return rows.map((r) => r.code);
  }

  /**
   * Returns a lightweight summary row for every saved participant — every
   * scalar field plus child-account counts. Used by the NSE participants
   * list view to render extra columns (contact, email, PAN, banks, demats,
   * notes) alongside the upstream `{ code, name }` from NSE.
   *
   * Address strings, full email/mobile lists and notes are inlined here too
   * so the operator can scan / filter on them client-side without a
   * round-trip for every row. The list maxes out at a few hundred entries
   * in practice so a single `findMany` is cheap.
   */
  async listAllInfoSummary() {
    const rows = await db.dataBase.nseRfqParticipantInfoModel.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        code: true,
        nameOverride: true,
        contactPerson: true,
        emailList: true,
        mobileList: true,
        telephone: true,
        address: true,
        address2: true,
        address3: true,
        stateCode: true,
        panNo: true,
        leiCode: true,
        custodian: true,
        dobDoi: true,
        notes: true,
        updatedAt: true,
        _count: {
          select: { bankAccounts: true, dematAccounts: true },
        },
      },
    });

    return rows.map((row) => ({
      code: row.code,
      nameOverride: row.nameOverride,
      contactPerson: row.contactPerson,
      emailList: row.emailList,
      mobileList: row.mobileList,
      telephone: row.telephone,
      address: row.address,
      address2: row.address2,
      address3: row.address3,
      stateCode: row.stateCode,
      panNo: row.panNo,
      leiCode: row.leiCode,
      custodian: row.custodian,
      dobDoi: row.dobDoi,
      notes: row.notes,
      bankAccountsCount: row._count.bankAccounts,
      dematAccountsCount: row._count.dematAccounts,
      updatedAt: row.updatedAt,
    }));
  }
}
