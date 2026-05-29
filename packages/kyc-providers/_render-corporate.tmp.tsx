import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import CorpoRatePdf from "./pdf/corporate/CorpoRatePdf";
import type { CorporateKycPdfData } from "./pdf/corporate/corporateKycPdfData";

const data: CorporateKycPdfData = {
  entityName: "Demo Company",
  applicationNumber: "24",
  pan: "FOZPB6904L",
  entityType: "PUBLIC_LIMITED",
  declarationDate: "2026-05-29",
  proofOfId: {
    certificateOfIncorporation: true,
    memorandumOfArticles: true,
    boardResolution: true,
    powerOfAttorney: true,
  },
  registered: {
    line1: "sdasdas as dasd",
    line2: "sadas",
    city: "gurugram",
    district: "Gtaavat",
    state: "Haryana",
    country: "India",
    pincode: "122001",
  },
  correspondence: {
    line1: "sdasdas as dasd",
    line2: "sadas",
    city: "gurugram",
    district: "Gtaavat",
    state: "Haryana",
    country: "India",
    pincode: "122001",
  },
  contact: {
    email: "info@democompany.com",
    mobile: "9876543210",
  },
  relatedPerson: {
    name: "Sourav",
  },
  bankAccounts: [
    {
      isPrimary: true,
      bankName: "BaysV Bank",
      branch: "Jgytahs",
      ifsc: "HDFC0000090",
      accountNumber: "13456780",
    },
  ],
  dematAccounts: [
    {
      isPrimary: true,
      depositoryNsdl: true,
      dpName: "Fagars",
      dpId: "45456667",
      beneficiaryId: "12416342",
    },
  ],
};

const out = process.argv[2] ?? "./out-corporate.pdf";
await renderToFile(<CorpoRatePdf data={data} />, out);
console.log("Rendered:", out);
