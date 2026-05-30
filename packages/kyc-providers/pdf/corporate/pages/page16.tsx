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
 * Page 16 — Ref P19 — Document Checklist for HUF.
 */
function CorporateKycPdfPage16Content() {
  return (
    <View style={{ fontFamily: "Poppins", paddingHorizontal: hx, paddingTop: 14 }}>
      <ChecklistHeader title="Document Checklist for HUF" />

      <Para mt={1}>
        You are requested to duly fill-in, stamp and sign the Non-Individual KYC Form and submit the same along with
        certified copy of the requisite KYC documents as stated below
      </Para>

      <SectionTitle mt={5}>Non-Individual KYC Form: The form consists of:</SectionTitle>
      <OrderedList
        items={[
          "Part 1: Non-Individual KYC form,",
          "Part 2: Related Person KYC Form (Karta)",
          "Part 3: Additional Details",
          "Part 4: Details of HUF Bank Account / Demat Account",
          "Annexure I (Details of Karta forming part of Know Your Client (KYC) Application form for Non-Individuals)",
          "FATCA Form (Annexure 1.1)",
          "ICCL (BSE) Form",
          "NCL (NSE) Form",
          "Karta Self Declaration form (if Karta is Female)",
        ]}
      />

      <SectionTitle mt={5}>
        KYC Documents: Please submit certified copies (self attested by authorised signatory) of the following Documents:
      </SectionTitle>

      <SectionTitle mt={3}>A. HUF</SectionTitle>

      <RomanSection roman="I" heading="PAN" />
      <RomanSection roman="II" heading="Proof of Identity: Deed of Declaration of HUF or List of Co-Parceners" />

      <RomanSection
        roman="III"
        heading="Proof of Address (Choose Any One Document):"
        noteAbove="Note: In case Registered Address and Correspondence / Local Address in India (if different from Registered Address) then we request you to submit Proof for both the addresses."
        bullets={[
          "Latest Bank Account Statement (not older than 2 months) / Bank Passbook in the name of HUF",
          "Latest Electricity Bill (not older than 2 months)",
          "Latest Telephone Bill (not older than 2 months)",
          "Registered Lease / Sale Agreement of Office Premises (Please verify the Validity / Expiry Date)",
        ]}
      />

      <RomanSection
        roman="IV"
        heading="Proof of HUF Bank Account: Any one of the following:"
        bullets={[
          "Cancelled Cheque",
          "Bank Statement (not more than 2 months old)",
          "Bank Passbook",
        ]}
      />
      <View style={{ paddingLeft: 20 }}>
        <Para mt={0}>Note: Bank statement / Passbook should specify name of HUF, IFSC code, Bank Account Number.</Para>
      </View>

      <RomanSection
        roman="V"
        heading="Proof of HUF Demat Account:"
        bullets={[
          "Client Master List (CML)",
          "Demat Holding / Transaction Statement (The statement should contain Name of the Demat account holder and Demat account details)",
          "Consolidated Account Statement (CAS) issued by Depositories.",
        ]}
      />

      <SectionTitle mt={5}>B. Karta</SectionTitle>
      <CommonRelatedPersonBlock />

      <CommonOtherEntityBlock />
    </View>
  );
}

export default CorporateKycPdfPage16Content;
