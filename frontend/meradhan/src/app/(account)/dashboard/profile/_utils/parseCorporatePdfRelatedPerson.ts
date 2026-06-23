import type { CorporateKycResponse } from "@root/apiGateway";

export type CorporatePdfAddress = {
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  country?: string;
};

export type CorporatePdfRelatedPerson = {
  pan?: string;
  form60?: boolean;
  name?: string;
  maidenName?: string;
  fatherOrSpouseName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  residentialStatus?: string;
  occupationType?: string;
  occupationOther?: string;
  relatedPersonTypes?: string[];
  relatedPersonOther?: string;
  din?: string;
  correspondenceAddress?: CorporatePdfAddress;
  contact?: {
    email?: string;
    mobile?: string;
    mobileAlternate?: string;
    telephoneOffice?: string;
    telephoneResidence?: string;
  };
  pepStatus?: string;
};

export function parseCorporatePdfRelatedPerson(
  payload: Record<string, unknown> | null | undefined,
): CorporatePdfRelatedPerson | null {
  if (!payload || typeof payload !== "object") return null;
  const rp = payload.relatedPerson;
  if (!rp || typeof rp !== "object") return null;
  return rp as CorporatePdfRelatedPerson;
}

export function getRelatedPersonFallback(
  corporateKyc: CorporateKycResponse,
): {
  name?: string;
  pan?: string;
  email?: string;
  mobile?: string;
  designation?: string;
} | null {
  const signatory = corporateKyc.authorisedSignatories?.[0];
  if (signatory) {
    return {
      name: signatory.fullName,
      pan: signatory.pan,
      email: signatory.email,
      mobile: signatory.mobile,
      designation: signatory.designation,
    };
  }
  const director = corporateKyc.directors?.[0];
  if (director) {
    return {
      name: director.fullName,
      pan: director.pan,
      email: director.email,
      mobile: director.mobile,
      designation: director.designation,
    };
  }
  return null;
}
