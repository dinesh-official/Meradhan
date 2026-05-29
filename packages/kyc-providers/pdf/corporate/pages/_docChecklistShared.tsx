import { Text, View } from "@react-pdf/renderer";
import { Fragment, type ReactNode } from "react";

const navy = "#002C59";

// Tight sizing so each entire doc-checklist fits on a single A4 page.
const FONT_BODY = 7.2;
const FONT_SECTION = 8;
const FONT_HEADER = 9;
const LH = 1.25;

export function ChecklistHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        backgroundColor: navy,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 3,
        marginBottom: 5,
      }}
    >
      <Text style={{ fontSize: FONT_HEADER, color: "#ffffff", fontWeight: 700 }}>{title}</Text>
    </View>
  );
}

export function Para({ children, mt = 2 }: { children: ReactNode; mt?: number }) {
  return (
    <Text style={{ fontSize: FONT_BODY, lineHeight: LH, marginTop: mt, color: "#0b0b0b" }}>{children}</Text>
  );
}

export function Bold({ children, mt = 4 }: { children: ReactNode; mt?: number }) {
  return (
    <Text style={{ fontSize: FONT_BODY, fontWeight: 700, marginTop: mt, color: "#0b0b0b" }}>
      {children}
    </Text>
  );
}

/**
 * Ordered list with arabic numerals (1., 2., 3., ...). Items wrap correctly.
 */
export function OrderedList({ items }: { items: ReactNode[] }) {
  return (
    <View style={{ marginTop: 2 }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 1 }}>
          <Text style={{ fontSize: FONT_BODY, width: 16, textAlign: "right", paddingRight: 4 }}>{i + 1}.</Text>
          <Text style={{ fontSize: FONT_BODY, flex: 1, lineHeight: LH }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Roman-numeral ordered list (I, II, III, ...). Used for KYC sub-sections.
 */
export function RomanList({ items, startAt = 1 }: { items: ReactNode[]; startAt?: number }) {
  const roman = (n: number): string => {
    const numerals: Array<[number, string]> = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
      [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    let v = n;
    let out = "";
    for (const [val, sym] of numerals) {
      while (v >= val) {
        out += sym;
        v -= val;
      }
    }
    return out;
  };
  return (
    <View style={{ marginTop: 2 }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 1 }}>
          <Text style={{ fontSize: FONT_BODY, width: 20, textAlign: "right", paddingRight: 4, fontWeight: 600 }}>
            {roman(startAt + i)}
          </Text>
          <Text style={{ fontSize: FONT_BODY, flex: 1, lineHeight: LH }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Plain bulleted list (• item).
 */
export function BulletList({ items, indent = 12 }: { items: ReactNode[]; indent?: number }) {
  return (
    <View style={{ marginTop: 1, paddingLeft: indent }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 0 }}>
          <Text style={{ fontSize: FONT_BODY, width: 9 }}>•</Text>
          <Text style={{ fontSize: FONT_BODY, flex: 1, lineHeight: LH }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function SectionTitle({ children, mt = 4 }: { children: ReactNode; mt?: number }) {
  return (
    <Text style={{ fontSize: FONT_SECTION, fontWeight: 700, marginTop: mt, color: navy }}>{children}</Text>
  );
}

export function NoteText({ children, mt = 1 }: { children: ReactNode; mt?: number }) {
  return (
    <Text style={{ fontSize: 6.5, fontStyle: "italic", marginTop: mt, color: "#444" }}>{children}</Text>
  );
}

/**
 * Sub-section row with roman numeral + heading text on first line, body below.
 * Used for the I/II/III KYC document sub-sections inside each checklist.
 */
export function RomanSection({
  roman,
  heading,
  body,
  bullets,
  bottomBullets,
  noteAbove,
}: {
  roman: string;
  heading: ReactNode;
  body?: ReactNode;
  bullets?: ReactNode[];
  bottomBullets?: ReactNode[];
  noteAbove?: ReactNode;
}) {
  return (
    <View style={{ marginTop: 2 }}>
      <View style={{ flexDirection: "row" }}>
        <Text style={{ fontSize: FONT_BODY, width: 20, fontWeight: 700 }}>{roman}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FONT_BODY, lineHeight: LH, fontWeight: 600 }}>{heading}</Text>
          {noteAbove ? (
            <Text style={{ fontSize: 6.5, fontStyle: "italic", marginTop: 0, color: "#444", lineHeight: LH }}>
              {noteAbove}
            </Text>
          ) : null}
          {body ? <Text style={{ fontSize: FONT_BODY, marginTop: 0, lineHeight: LH }}>{body}</Text> : null}
          {bullets ? <BulletList items={bullets} indent={4} /> : null}
          {bottomBullets ? <BulletList items={bottomBullets} indent={4} /> : null}
        </View>
      </View>
    </View>
  );
}

export const IDENTITY_PROOF_BULLETS: string[] = [
  "Aadhaar Card ('Redact' or 'Blackout' of all nos. except last four digits)",
  "Passport",
  "Voter ID Card",
  "Driving License",
  "NREGA Job Card",
  "NPR",
  "Others: ____________ Identification Number: ____________ (any document notified by the Central Government)",
];

export function CommonRelatedPersonBlock() {
  return (
    <Fragment>
      <RomanSection roman="I" heading="Please Affix a Photo in the Related Person Form and sign across the photograph" />
      <RomanSection roman="II" heading="PAN" />
      <RomanSection
        roman="III"
        heading="Proof of Identity: Please submit a certified copy of any one document"
        bullets={IDENTITY_PROOF_BULLETS}
      />
      <RomanSection
        roman="IV"
        heading="Proof of Address (Choose Any One Document)"
        noteAbove="Note: In case the Correspondence / Local Address and Permanent Address is different then we request you to submit Proof for both the addresses."
        bullets={IDENTITY_PROOF_BULLETS}
      />
    </Fragment>
  );
}

export function CommonOtherEntityBlock() {
  return (
    <View style={{ marginTop: 5 }}>
      <Text style={{ fontSize: FONT_SECTION, fontWeight: 700, color: navy }}>Unincorporated Association or a Body of Individuals</Text>
      <BulletList
        items={[
          "Proof of existence or Constitution document.",
          "Resolution of managing Body and power of Attorney granted to transact business on its behalf.",
        ]}
      />
      <Text style={{ fontSize: FONT_SECTION, fontWeight: 700, color: navy, marginTop: 3 }}>Registered Society</Text>
      <BulletList
        items={[
          "Copy of Registration Certificate under Society Registration Act.",
          "List of managing committee members.",
          "Committee Resolution for persons authorized to act as authorised signatories with specimen signatures.",
          "True copy of society rules and by-laws certified by Chairman/Secretary.",
        ]}
      />
    </View>
  );
}

// PageFootMarker removed — the absolute-positioned marker inside the page View
// was orphaning onto an extra page when content was close to A4 height.
