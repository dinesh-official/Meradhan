import type {
  BaseResponseData,
  PaginationMeta,
} from "../../../../../types/base";

export type ParticipantResponseData = BaseResponseData<{
  data: ParticipantData[];
  meta: PaginationMeta;
}>;

export interface ParticipantData {
  key: number;
  id: number;
  loginId: string;
  userId: number;
  actualStatus: number;
  workflowStatus: number;
  firstName: string;
  panNo: string;
  custodian?: string;
  contactPerson: string;
  mobileList: string[];
  emailList: string[];
  telephone: string;
  fax?: string;
  address: string;
  address2: string;
  address3: string;
  stateCode: string;
  regAddress: string;
  leiCode?: string;
  expiryDate?: string;
  panVerStatus?: number;
  panVerRemarks?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  bankAccountList: BankAccountList[];
  dpAccountList: DpAccountList[];
}

interface BankAccountList {
  id: number;
  bankName: string;
  bankIFSC: string;
  bankAccountNo: string;
  isDefault: string;
  workflowStatus: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  nseCbricsParticipantModelId: number;
}

interface DpAccountList {
  id: number;
  dpType: string;
  dpId: string;
  benId: string;
  isDefault: string;
  workflowStatus: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  nseCbricsParticipantModelId: number;
}
