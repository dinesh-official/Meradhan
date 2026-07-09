import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfStr } from "../corporateKycPdfData";

const hx = 32;
const borderColor = "#cfd5de";

function joinNonEmpty(parts: Array<string | undefined>): string {
  return parts.filter((p) => !!p && String(p).trim().length > 0).join(", ");
}

function fullRegisteredAddress(data: CorporateKycPdfData): string {
  const r = data.registered ?? {};
  return joinNonEmpty([r.line1, r.line2, r.line3, r.city, r.district, r.state, r.country, r.pincode]);
}

function fullRegisteredAddressNoPincode(data: CorporateKycPdfData): string {
  const r = data.registered ?? {};
  return joinNonEmpty([r.line1, r.line2, r.line3, r.city, r.district, r.state, r.country]);
}

function pickPrimary<T extends { isPrimary?: boolean }>(arr: T[] | undefined): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr.find((x) => x.isPrimary === true) ?? arr[0];
}

const ROW_HEIGHT = 17;
const ROW_HEIGHT_TALL = 24;

function TableRow({ srNo, particular, value, height }: { srNo: string; particular: string; value: string; height?: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderColor,
        minHeight: height ?? ROW_HEIGHT,
        alignItems: "center",
      }}
    >
      <View style={{ width: "9%", padding: 3, borderRightWidth: 0.5, borderColor, justifyContent: "center" }}>
        <Text style={{ fontSize: 7.5, textAlign: "center" }}>{srNo}</Text>
      </View>
      <View style={{ width: "41%", padding: 3, borderRightWidth: 0.5, borderColor, justifyContent: "center" }}>
        <Text style={{ fontSize: 7.5 }}>{particular}</Text>
      </View>
      <View style={{ width: "50%", padding: 3, justifyContent: "center" }}>
        <Text style={{ fontSize: 7.5, fontWeight: 500 }}>{value}</Text>
      </View>
    </View>
  );
}

/**
 * Page 12 — Ref P15 — NCL Annexure (Format of letter to NSE Clearing Ltd
 * providing bank & DP details for settlement of corporate debt instruments).
 *
 * Mostly a static letter template with a 19-row table that is auto-prefilled from
 * available KYC data (entity name, address, contact, primary bank/demat).
 */
function CorporateKycPdfPage12Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const bank = pickPrimary(data.bankAccounts);
  const demat = pickPrimary(data.dematAccounts);
  const contact = data.contact ?? {};
  const registered = data.registered ?? {};

  const depositoryStr = demat?.depositoryNsdl
    ? "NSDL"
    : demat?.depositoryCdsl
      ? "CDSL"
      : " ";

  return (
    <View style={{ fontFamily: "Poppins", paddingHorizontal: hx, paddingTop: 18 }}>
      <Text style={{ fontSize: 12, fontWeight: 700, textAlign: "center", color: "#0b0b0b" }}>NCL ANNEXURE</Text>
      <Text style={{ fontSize: 7.5, textAlign: "center", marginTop: 2 }}>
        Format of letter providing bank & DP details for settlement of corporate debt instruments (on participant&apos;s letter head)
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <View>
          <Text style={{ fontSize: 8 }}>The Manager,</Text>
          <Text style={{ fontSize: 8 }}>NSE Clearing Ltd - Corporate Bond Settlements,</Text>
          <Text style={{ fontSize: 8 }}>4th Floor, NSE Exchange Plaza,</Text>
          <Text style={{ fontSize: 8 }}>Plot no. C/1, G Block,</Text>
          <Text style={{ fontSize: 8 }}>Bandra-Kurla Complex</Text>
          <Text style={{ fontSize: 8 }}>Bandra (E), Mumbai - 400 051</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 8 }}>Date:</Text>
          <View style={{ borderBottomWidth: 0.5, borderColor: "#999", paddingHorizontal: 6, paddingVertical: 1, minWidth: 100 }}>
            <Text style={{ fontSize: 8, textAlign: "center" }}>{pdfStr(data.declarationDate)}</Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 8.5, fontWeight: 600, marginTop: 8 }}>
        Sub: Bank & DP details for settlement of Corporate Debt Instruments
      </Text>

      <Text style={{ fontSize: 8, marginTop: 4, lineHeight: 1.3 }}>
        We are interested in carrying out the clearing and settlement of our trades in corporate debt instruments through NSE
        Clearing Ltd (NCL). In this regard, please find below the details of our Bank and DP account
      </Text>

      <View style={{ marginTop: 8, borderWidth: 0.5, borderColor }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#f4f6fa",
            borderBottomWidth: 0.5,
            borderColor,
          }}
        >
          <View style={{ width: "9%", padding: 4, borderRightWidth: 0.5, borderColor }}>
            <Text style={{ fontSize: 7.5, fontWeight: 700, textAlign: "center" }}>Sr. No.</Text>
          </View>
          <View style={{ width: "41%", padding: 4, borderRightWidth: 0.5, borderColor }}>
            <Text style={{ fontSize: 7.5, fontWeight: 700 }}>Particulars</Text>
          </View>
          <View style={{ width: "50%", padding: 4 }}>
            <Text style={{ fontSize: 7.5, fontWeight: 700 }}>To be filled by the Participant</Text>
          </View>
        </View>

        <TableRow srNo="1" particular="Participant Name" value={pdfStr(data.entityName)} />
        <TableRow srNo="2" particular="Participant Code" value={pdfStr(data.nclParticipantCode ?? data.nclDirectCode ?? data.applicationNumber)} />
        <TableRow srNo="3" particular="Contact Person" value={pdfStr(data.relatedPerson?.name)} />
        <TableRow srNo="4" particular="E-mail id of contact person" value={pdfStr(contact.email)} />
        <TableRow
          srNo="5"
          particular="Address for Communication with Pin Code"
          value={pdfStr(fullRegisteredAddress(data) || undefined)}
          height={ROW_HEIGHT_TALL}
        />
        <TableRow
          srNo="6"
          particular="Phone/Mobile Number of Contact Person (with STD Code)"
          value={pdfStr(contact.mobile ?? contact.telephoneOff)}
        />
        <TableRow srNo="7" particular="Fax Number (with STD Code)" value={pdfStr(contact.fax)} />
        <TableRow srNo="8" particular="Bank Name" value={pdfStr(bank?.bankName)} />
        <TableRow srNo="9" particular="Bank Branch" value={pdfStr(bank?.branch)} />
        <TableRow srNo="10" particular="Bank IFSC Code (RTGS)" value={pdfStr(bank?.ifsc)} />
        <TableRow srNo="11" particular="Bank Account No." value={pdfStr(bank?.accountNumber)} />
        <TableRow srNo="12" particular="Depository (NSDL/CDSL)" value={depositoryStr} />
        <TableRow srNo="13" particular="DP Name" value={pdfStr(demat?.dpName)} />
        <TableRow srNo="14" particular="DP ID" value={pdfStr(demat?.dpId)} />
        <TableRow srNo="15" particular="Client ID" value={pdfStr(demat?.beneficiaryId)} />
        <TableRow srNo="16" particular="PAN" value={pdfStr(data.pan)} />
        <TableRow
          srNo="17"
          particular="Registered Office Address (For GST)"
          value={pdfStr(fullRegisteredAddressNoPincode(data) || undefined)}
          height={ROW_HEIGHT_TALL}
        />
        <TableRow srNo="18" particular="Registered Office GST Number (15 Digit)" value=" " />
        <TableRow srNo="19" particular="Registered Office State" value={pdfStr(registered.state)} />
      </View>

      <Text style={{ fontSize: 7.5, marginTop: 6, fontStyle: "italic" }}>
        * Please attach attested copies of recent Bank statement, DP statement and PAN card copy along with this letter
      </Text>

      <Text style={{ fontSize: 8, marginTop: 4, lineHeight: 1.3 }}>
        We undertake that the above mentioned bank and DP accounts shall be used for the purpose of making pay-ins and
        receiving pay-outs for settlement of corporate debt instrument deals through NCL.
      </Text>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 8 }}>Your Sincerely,</Text>
        <Text style={{ fontSize: 8, marginTop: 10, fontWeight: 600 }}>Authorised Signatory</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 }}>
          <Text style={{ fontSize: 8 }}>Name:</Text>
          <View style={{ borderBottomWidth: 0.5, borderColor: "#999", flex: 0.5 }}>
            <Text style={{ fontSize: 8, paddingLeft: 4 }}>{pdfStr(data.relatedPerson?.name)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 }}>
          <Text style={{ fontSize: 8 }}>Designation:</Text>
          <View style={{ borderBottomWidth: 0.5, borderColor: "#999", flex: 0.5 }}>
            <Text style={{ fontSize: 8, paddingLeft: 4 }}> </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default CorporateKycPdfPage12Content;
