import { db } from "@core/database/database";

export const CrmSavedProposalsRepo = {
  create(input: {
    createdById: number;
    customerProfileId?: number | null;
    linkedRfqParticipantCode?: string | null;
    isin: string;
    bondName: string;
    side: string;
    quantity: number;
    notes?: string | null;
    data: unknown;
  }) {
    return db.dataBase.crmSavedProposal.create({
      data: {
        createdById: input.createdById,
        customerProfileId: input.customerProfileId ?? null,
        linkedRfqParticipantCode: input.linkedRfqParticipantCode ?? null,
        isin: input.isin,
        bondName: input.bondName,
        side: input.side,
        quantity: input.quantity,
        notes: input.notes ?? null,
        data: input.data as object,
      },
    });
  },

  listByCreatedBy(createdById: number) {
    return db.dataBase.crmSavedProposal.findMany({
      where: { createdById },
      orderBy: { createdAt: "desc" },
    });
  },

  listAll() {
    return db.dataBase.crmSavedProposal.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number, createdById: number) {
    return db.dataBase.crmSavedProposal.findFirst({
      where: { id, createdById },
    });
  },

  deleteById(id: number, createdById: number) {
    return db.dataBase.crmSavedProposal.deleteMany({
      where: { id, createdById },
    });
  },
};

