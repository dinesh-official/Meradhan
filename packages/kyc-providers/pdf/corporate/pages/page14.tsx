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
 * Page 14 — Ref P17 — Document Checklist for Partnership.
 */
function CorporateKycPdfPage14Content() {
  return (
    <View style={{ fontFamily: "Poppins", paddingHorizontal: hx, paddingTop: 14 }}>
      <ChecklistHeader title="Document Checklist for Partnership" />

      <Para mt={1}>
        You are requested to duly fill in, stamp and sign the Non-Individual KYC Form and submit the same along with a
        certified copy of the requisite KYC documents as stated below:
      </Para>

      <SectionTitle mt={5}>Non-Individual KYC Form: The form consists of:</SectionTitle>
      <OrderedList
        items={[
          "Part 1: Non-Individual KYC form,",
          "Part 2: Related Person KYC Form (Note: Mandatorily to be filled for All Partners)",
          "Part 3: Additional Details",
          "Part 4: Part A Details of Partnership Bank Account and Part B Demat Account",
          "Annexure I (Details of Partners and Authorized Signatories forming part of Know Your Client (KYC) Application form for Non-Individuals),",
          "FATCA Form and UBO Declaration (Annexure 1.1 / Annexure 1.2)",
          "ICCL (BSE) Form",
          "NCL (NSE) Form",
        ]}
      />

      <SectionTitle mt={5}>
        KYC Documents: Please submit certified copies (self attested by authorised signatory) of the following Documents:
      </SectionTitle>

      <SectionTitle mt={3}>A. Partnership</SectionTitle>

      <RomanSection roman="I" heading="PAN" />
      <RomanSection roman="II" heading="Proof of Identity: Partnership Deed" />

      <RomanSection
        roman="III"
        heading="Proof of Address (Choose Any One Document):"
        noteAbove="Note: In case the Registered Address and Correspondence / Local Address in India (if different from the Registered Address) then we request you to submit Proof for both addresses."
        bullets={[
          "Latest Bank Account Statement (not older than 2 months) / Bank Passbook in the name of Partnership Firm",
          "Latest Electricity Bill (not older than 2 months)",
          "Latest Telephone Bill (not older than 2 months)",
          "Registered Lease / Sale Agreement of Office Premises (Please verify the Validity / Expiry Date)",
          "Registration Certificate",
        ]}
      />

      <RomanSection
        roman="IV"
        heading="Additional Documents:"
        bullets={[
          "Certificate of Registration (for registered partnership firm)",
          "Partnership Deed",
          "Partnership Resolution",
          "Balance Sheet for the Last Financial Year (initially for last two financial years and subsequently for every last financial year)",
          "Authorized Signatories List with Specimen Signatures",
          "Partners Holdings (in value and %)",
        ]}
      />

      <RomanSection
        roman="V"
        heading="Proof of Partnership Bank Account: Any one of the following:"
        bullets={[
          "Cancelled Cheque",
          "Bank Statement (not more than 2 months old)",
          "Bank Passbook",
        ]}
      />
      <View style={{ paddingLeft: 20 }}>
        <Para mt={0}>
          Note: Bank statement/Passbook should specify name of Partnership, IFSC code, account no.
        </Para>
      </View>

      <RomanSection
        roman="VI"
        heading="Proof of Partnership Demat Account:"
        bullets={[
          "Client Master List (CML) (mandatory for partnership account)",
          "Demat Holding / Transaction Statement (The statement should contain the Name of the Demat account holder and Demat account details)",
          "Consolidated Account Statement (CAS) issued by Depositories.",
        ]}
      />

      <SectionTitle mt={5}>
        B. Authorised signatory and partners: (Note: Mandatorily to be filled for All Partners / Authorised signatories)
      </SectionTitle>
      <CommonRelatedPersonBlock />

      <CommonOtherEntityBlock />
    </View>
  );
}

export default CorporateKycPdfPage14Content;
