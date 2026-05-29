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
 * Page 13 — Ref P16 — Document Checklist for Corporate (Pvt Ltd / Pub Ltd / LLP).
 * Static instructional content rendered as part of every Non-Individual KYC PDF.
 */
function CorporateKycPdfPage13Content() {
  return (
    <View style={{ fontFamily: "Poppins", paddingHorizontal: hx, paddingTop: 14 }}>
      <ChecklistHeader title="Document Checklist for Corporate - Private Limited / Public Limited and LLP" />

      <Para mt={1}>
        You are requested to duly fill in, stamp and sign the Non-Individual KYC Form and submit the same along with a
        certified copy of the requisite KYC documents as stated below:
      </Para>

      <SectionTitle mt={5}>Non-Individual KYC Form: The form consist of:</SectionTitle>
      <OrderedList
        items={[
          "Part 1: Non-Individual KYC form,",
          "Part 2: Related Person KYC Form (Authorised Signatory)",
          "Part 3: Additional Details",
          "Part 4: Part A Details of Corporate Bank Account and Part B Demat Account",
          "Annexure I (Details of Promoters / Partners and whole time directors forming part of Know Your Client (KYC) Application form for Non-Individuals),",
          "FATCA Form (Annexure 1.1)",
          "Ultimate Beneficiary Ownership (if applicable) Note: Mandatory for all entities except listed company or subsidiary of / controlled by a listed company and UBO holding is more than 10% (Corporate / 10% (entities other than corporate) (Annexure 1.2).",
          "ICCL (BSE) Form",
          "NCL (NSE) Form",
        ]}
      />

      <SectionTitle mt={5}>
        KYC Documents: Please submit certified copies (self attested by authorised signatory) of the following Documents:
      </SectionTitle>

      <SectionTitle mt={3}>A. Corporate</SectionTitle>

      <RomanSection roman="I" heading="PAN" />

      <RomanSection
        roman="II"
        heading="Proof of Address (Choose Any One Document):"
        noteAbove="Note: In case the Registered Address and Correspondence / Local Address in India (if different from the Registered Address) then we request you to submit Proof for both addresses."
        bullets={[
          "Latest Bank Account Statement (not older than 2 months) / Bank Passbook in the name of Corporate/LLP",
          "Latest Electricity Bill (not older than 2 months)",
          "Latest Telephone Bill (not older than 2 months)",
          "Registered Lease / Sale Agreement of Office Premises (Please verify the Validity / Expiry Date)",
          "Certification of incorporation",
          "Registration Certificate",
        ]}
      />

      <RomanSection
        roman="III"
        heading="Additional Documents:"
        bullets={[
          "Certificate of incorporation.",
          "Memorandum and Articles of Association.",
          "Board Resolution for investment in the securities market.",
          "Power of Attorney granted to its managers, officers or employees, as the case may be, to transact on its behalf.",
          "Authorised signatories list with specimen signatures.",
          "Copy of the balance sheet for the last financial year (initially for the last two financial years and subsequently for every last financial year).",
          "The latest shareholding pattern including the list of all those holding controls, either directly or indirectly, in the company in terms of SEBI takeover Regulations, duly certified by the company secretary/whole-time director/ MD (to be submitted every year).",
          "Individual Promoters (if applicable): Photograph, Proof of Identity, Proof of Address, PAN of individual promoters holding control - either directly or indirectly.",
        ]}
      />

      <RomanSection
        roman="IV"
        heading="Proof of Corporate Bank Account: Any one of the following:"
        bullets={[
          "Cancelled Cheque",
          "Bank Statement (not more than 2 months old)",
          "Bank Passbook",
        ]}
      />
      <View style={{ paddingLeft: 20 }}>
        <Para mt={0}>
          Note: Bank statement/Passbook should specify name of the Corporate, MICR Code or/and IFSC code of the Bank
        </Para>
      </View>

      <RomanSection
        roman="V"
        heading="Proof of Corporate Demat Account:"
        bullets={[
          "Client Master List (CML)",
          "Demat Holding / Transaction Statement (The statement should contain the Name of the Demat account holder and Demat account details)",
          "Consolidated Account Statement (CAS) issued by Depositories.",
        ]}
      />

      <SectionTitle mt={5}>
        B. Related Person Form: Please fill in the Related Person form for 1) Authorised signatory, 2) whole-time directors
        or two directors in charge of day-to-day operations
      </SectionTitle>
      <CommonRelatedPersonBlock />

      <CommonOtherEntityBlock />
    </View>
  );
}

export default CorporateKycPdfPage13Content;
