import { PartnershipFormData } from "./partnershipFormData.schema";
import { CrmUsersProfile } from "@root/apiGateway";

export interface IPartnershipDataFormHook {
  state: PartnershipFormData;
  errors: Partial<Record<keyof PartnershipFormData, string[]>>;
  setPartnershipData: <K extends keyof PartnershipFormData>(
    key: K,
    value: PartnershipFormData[K]
  ) => void;
  setPartnershipDataMany: (patch: Partial<PartnershipFormData>) => void;
  validateField: <K extends keyof PartnershipFormData>(
    key: K,
    value: PartnershipFormData[K]
  ) => void;
  validatePartnershipData: () => boolean;
  resetPartnershipData: () => void;
  createPartnershipMutation: {
    mutate: (data: PartnershipFormData) => void;
    isPending: boolean;
  };
  updatePartnershipMutation: {
    mutate: (data: Partial<PartnershipFormData>) => void;
    isPending: boolean;
  };
  relationManager: {
    relationManager: CrmUsersProfile | undefined;
    setRelationManager: (user: CrmUsersProfile | undefined) => void;
  };
}

