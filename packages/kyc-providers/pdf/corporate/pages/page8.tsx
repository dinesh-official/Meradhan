import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";

const borderColor = "#0b0b0b";
const headerBg = "#ffffff";

const COLS = [
  { key: "sr", header: "Sr. No.", width: "5%" },
  { key: "pan", header: "PAN", width: "11%" },
  { key: "name", header: "Name", width: "13%" },
  { key: "dinAadhaar", header: "DIN (For Directors)\nAadhaar\n(for others)", width: "11%" },
  { key: "address", header: "Residential /\nRegistered Address", width: "14%" },
  { key: "relationship", header: "Relationship with\nApplicant (i.e. promoters,\nwhole time directors etc.)", width: "17%" },
  { key: "pep", header: "Whether\nPolitically\nExposed?", width: "12%" },
  { key: "photo", header: "Photograph", width: "17%" },
] as const;

const ROW_COUNT = 4;
const DATA_ROW_HEIGHT = 95;

function HeaderCell({
  text,
  width,
  isLast,
}: {
  text: string;
  width: string;
  isLast: boolean;
}) {
  return (
    <View
      style={{
        width,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRightWidth: isLast ? 0 : 0.6,
        borderColor,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 7.5, fontWeight: 700 }}>{text}</Text>
    </View>
  );
}

function DataCell({
  width,
  isLast,
  children,
  align = "left",
}: {
  width: string;
  isLast: boolean;
  children?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <View
      style={{
        width,
        padding: 4,
        borderRightWidth: isLast ? 0 : 0.6,
        borderColor,
        height: DATA_ROW_HEIGHT,
        alignItems: align === "center" ? "center" : "flex-start",
        justifyContent: "flex-start",
      }}
    >
      {children}
    </View>
  );
}

function CellText({ value }: { value?: string }) {
  if (!value) return null;
  return <Text style={{ fontSize: 7 }}>{value}</Text>;
}

function PepGroup({ pep, rpep, pepNo }: { pep?: boolean; rpep?: boolean; pepNo?: boolean }) {
  return (
    <View style={{ flexDirection: "column", gap: 6, paddingTop: 4 }}>
      <CheckBoxRow fontSize={7} label="PEP" checked={pdfChk(pep)} />
      <CheckBoxRow fontSize={7} label="RPEP" checked={pdfChk(rpep)} />
      <CheckBoxRow fontSize={7} label="No" checked={pdfChk(pepNo)} />
    </View>
  );
}

/**
 * Page 8 — Annexure 1 — Details of Promoters / Partners / Karta / Trustees /
 * Whole-time Directors. Landscape A4. Layout follows reference KYC_P1_Non_Individuals_v1_P11.pdf.
 */
function CorporateKycPdfPage8Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const rows = data.promoterRows ?? [];

  return (
    <View style={{ fontFamily: "Poppins", paddingHorizontal: 28, paddingTop: 22 }}>
      <Text style={{ fontSize: 13, fontWeight: 700, textAlign: "center" }}>ANNEXURE 1</Text>
      <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
        Details of Promoters/Partners/Karta/Trustees and Whole-time Directors forming a part of Know Your Client (KYC)
        Application form for Non-Individuals
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, gap: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", flex: 1 }}>
          <Text style={{ fontSize: 8 }}>Name of Applicant:</Text>
          <View style={{ borderBottomWidth: 0.5, borderColor: "#666", flex: 1, marginLeft: 4, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 8 }}>{pdfStr(data.entityName)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", flex: 1 }}>
          <Text style={{ fontSize: 8 }}>PAN of the Applicant:</Text>
          <View style={{ borderBottomWidth: 0.5, borderColor: "#666", flex: 1, marginLeft: 4, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 8 }}>{pdfStr(data.pan)}</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 14, borderWidth: 0.6, borderColor }}>
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 0.6,
            borderColor,
            backgroundColor: headerBg,
            minHeight: 38,
          }}
        >
          {COLS.map((c, i) => (
            <HeaderCell key={c.key} text={c.header} width={c.width} isLast={i === COLS.length - 1} />
          ))}
        </View>

        {Array.from({ length: ROW_COUNT }).map((_, rowIdx) => {
          const r = rows[rowIdx] ?? {};
          const isLastRow = rowIdx === ROW_COUNT - 1;
          const dinAadhaar = r.din || r.aadhar;
          return (
            <View
              key={rowIdx}
              style={{
                flexDirection: "row",
                borderBottomWidth: isLastRow ? 0 : 0.6,
                borderColor,
              }}
            >
              <DataCell width={COLS[0].width} isLast={false} align="center">
                <Text style={{ fontSize: 7 }}>{rowIdx + 1}</Text>
              </DataCell>
              <DataCell width={COLS[1].width} isLast={false}>
                <CellText value={r.pan} />
              </DataCell>
              <DataCell width={COLS[2].width} isLast={false}>
                <CellText value={r.name} />
              </DataCell>
              <DataCell width={COLS[3].width} isLast={false}>
                <CellText value={dinAadhaar} />
              </DataCell>
              <DataCell width={COLS[4].width} isLast={false}>
                <CellText value={r.address} />
              </DataCell>
              <DataCell width={COLS[5].width} isLast={false}>
                <CellText value={r.relationship} />
              </DataCell>
              <DataCell width={COLS[6].width} isLast={false}>
                <PepGroup pep={r.pep} rpep={r.rpep} pepNo={r.pepNo} />
              </DataCell>
              <DataCell width={COLS[7].width} isLast={true} />
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, alignItems: "flex-end" }}>
        <View>
          <Text style={{ fontSize: 8 }}>Name &amp; Signature of the Authorised Signatory(ies)</Text>
          <Text style={{ fontSize: 8 }}>Along with Stamp</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
          <Text style={{ fontSize: 8 }}>Date:</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
            <Text style={{ fontSize: 8, color: "#999" }}>DD</Text>
            <Text style={{ fontSize: 8 }}>/</Text>
            <Text style={{ fontSize: 8, color: "#999" }}>MM</Text>
            <Text style={{ fontSize: 8 }}>/</Text>
            <Text style={{ fontSize: 8, color: "#999" }}>YYYY</Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 7.5, marginTop: 14 }}>
        * Note: If Partner / Director is more than four, please refer Annexure or attach one more supplement of the same page
      </Text>
    </View>
  );
}

export default CorporateKycPdfPage8Content;
