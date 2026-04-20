import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

const ROWS = [0, 1, 2, 3] as const;

/**
 * Page 8 — Annexure 1 promoters/partners/directors grid (KYC_P1_Non_Individuals_v1_P8.pdf). No logo / no footer.
 */
function CorporateKycPdfPage8Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const pad = { padding: 28 };
  const rows = data.promoterRows ?? [];

  return (
    <View style={[{ fontFamily: "Poppins" }, pad]}>

    </View>
  );
}

export default CorporateKycPdfPage8Content;
