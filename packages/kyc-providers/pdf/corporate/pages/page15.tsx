import { View } from "@react-pdf/renderer";
import {
  ChecklistHeader,
  CommonOtherEntityBlock,
  CommonRelatedPersonBlock,
  OrderedList,
  Para,
  RomanSection,
  SectionTitle,
} from "./_docChecklistShared";

const hx = 24;

/**
 * Page 15 — Ref P18 — Document Checklist for Trust.
 */
function CorporateKycPdfPage15Content() {
  return (
    <View style={{ fontFamily: "Poppins", paddingHorizontal: hx, paddingTop: 14 }}>
      <ChecklistHeader title="Document Checklist for Trust" />

      <Para mt={1}>
        You are requested to duly fill in, stamp and sign the Non-Individual KYC Form and submit the same along with a
        certified copy of the requisite KYC documents as stated below:
      </Para>

      <SectionTitle mt={5}>Non-Individual KYC Form: The form consists of:</SectionTitle>
      <OrderedList
        items={[
          "Part 1: Non-Individual KYC form,",
          "Part 2: Related Person KYC Form (for all authorised signatory/Trustees mentioned in Trust Resolution)",
          "Part 3: Additional Details",
          "Part 4: Part A Details of Trust Bank Account and Part B Demat Account",
          "Annexure I (Details of managing Trustees/ Trustees forming part of Know Your Client (KYC) Application form for Non-Individuals),",
          "FATCA Form (Annexure 1.1)",
          "Ultimate Beneficiary Ownership (if applicable) (Annexure 1.2). Mandatory for all entities except listed company or subsidiary of / controlled by a listed company and UBO holding is more than 10% (Corporate / 10% (entities other than corporate).",
          "ICCL (BSE) Form",
          "NCL (NSE) Form",
        ]}
      />

      <SectionTitle mt={5}>
        KYC Documents: Please submit certified copies (self attested by authorised signatory/Trustees) of the following Documents:
      </SectionTitle>

      <SectionTitle mt={3}>A. Trust</SectionTitle>

      <RomanSection roman="I" heading="PAN" />

      <RomanSection
        roman="II"
        heading="Proof of Address (Choose Any One Document):"
        noteAbove="Note: In case the Registered Address and Correspondence / Local Address in India (if different from the Registered Address) then we request you to submit Proof for both addresses."
        bullets={[
          "Latest Bank Account Statement (not older than 2 months) / Bank Passbook in the name of Trust.",
          "Latest Electricity Bill (not older than 2 months)",
          "Latest Telephone Bill (not older than 2 months)",
          "Registered Lease / Sale Agreement of Office Premises (Please verify the Validity / Expiry Date)",
          "Certification of Registration (For Registered Trust Only)",
        ]}
      />

      <RomanSection
        roman="III"
        heading="Additional Documents:"
        bullets={[
          "Certificate of registration (for Registered Trust Only).",
          "Copy of Trust deed.",
          "Copy of the balance sheet for the last financial year (initially for the last two financial years and subsequently for every last financial year).",
          "List of trustees certified by managing trustees/CA.",
          "Photograph, POI, POA, PAN of Trustees.",
          "Trust Resolution for Investment in Securities Market",
        ]}
      />

      <RomanSection
        roman="IV"
        heading="Proof of Trust Bank Account: Any one of the following:"
        bullets={[
          "Cancelled Cheque",
          "Bank Statement (not more than 2 months old)",
          "Bank Passbook",
        ]}
      />
      <View style={{ paddingLeft: 20 }}>
        <Para mt={0}>Note: Bank statement/Passbook should specify name of the Trust, IFSC code of the Bank</Para>
      </View>

      <RomanSection
        roman="V"
        heading="Proof of Trust Demat Account (any one):"
        bullets={[
          "Client Master List (CML)",
          "Demat Holding / Transaction Statement (The statement should contain the Name of the Trust and Demat account details)",
          "Consolidated Account Statement (CAS) issued by Depositories.",
        ]}
      />

      <SectionTitle mt={5}>
        B. Related Person Form: Please fill in the Related Person form for 1) Managing trustee 2) trustee 3) Authorised
        person (for all authorised signatory/Trustees mentioned in Trust Resolution)
      </SectionTitle>
      <CommonRelatedPersonBlock />

      <CommonOtherEntityBlock />
    </View>
  );
}

export default CorporateKycPdfPage15Content;
