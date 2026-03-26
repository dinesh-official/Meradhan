import { Image, Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";

function Page4(data: {
  name: string;
  date: string;
  place?: string;
  signatureUrl: string;
}) {
  return (
    <View style={tw("px-4")}>
      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-5")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          7. Applicant Declaration
        </Text>
      </View>

      <View style={tw(`w-[90%] mx-auto py-3 flex flex-col mt-3 `)}>
        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            gap: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Text style={{ marginRight: 8, marginTop: -4 }}>•</Text>
            <Text style={tw(`text-xs w-full  leading-[5px]`)}>
              I hereby affirm that the information and KYC particulars submitted
              above by me are accurate and complete to the best of my knowledge.
              I undertake to promptly notify MeraDhan of any change or
              modification in the said details. I understand that providing
              false, inaccurate, or misleading information may render me liable
              under applicable laws.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Text style={{ marginRight: 8, marginTop: -4 }}>•</Text>
            <Text style={tw(`text-xs w-full  leading-[5px]`)}>
              I consent to receiving updates, alerts, or communication from the
              Central KYC Registry and/or SEBI-registered KRAs via SMS and/or
              email at my registered contact details.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Text style={{ marginRight: 8, marginTop: -4 }}>•</Text>
            <Text style={tw(`text-xs w-full  leading-[5px]`)}>
              I acknowledge that, in the case of Aadhaar OVD-based KYC, my
              credentials will be authenticated against Aadhaar records. I
              consent to provide my masked Aadhaar card with visible QR code or
              Aadhaar XML/Digilocker XML file, together with passcode (where
              applicable), for limited use by KRAs and other registered
              intermediaries solely for KYC verification.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Text style={{ marginRight: 8, marginTop: -4 }}>•</Text>
            <Text style={tw(`text-xs w-full  leading-[5px] `)}>
              I expressly authorize BondNest Capital India Securities Private
              Limited (operating under the brand name “MeraDhan”) to retrieve
              and/or access my KYC information from the Central KYC Registry
              (CKYCR) for the purposes of identity/address verification, account
              opening, or carrying out necessary modifications in my client
              profile. I acknowledge that such KYC records may include my
              personal details such as name, address, date of birth, PAN, and
              other identifiers.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Text style={{ marginRight: 8, marginTop: -4 }}>•</Text>
            <Text style={tw(`text-xs w-full  leading-[5px]`)}>
              I agree and confirm that my KYC records may be shared with
              statutory bodies, regulators, and Know Your Client Registration
              Agencies (KRAs) for verification and compliance purposes, and that
              such information may be securely retained by MeraDhan for
              record-keeping as required under applicable regulations.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Text style={{ marginRight: 8, marginTop: -4 }}>•</Text>
            <Text style={tw(`text-xs w-full  leading-[5px]`)}>
              I further consent to receiving product-related communications,
              service notifications, or updates through SMS and/or email from
              BondNest Capital India Securities Private Limited and its
              authorized third-party service providers at my registered contact
              details.
            </Text>
          </View>

          {/* // end content  */}

          <View style={tw(`flex justify-between flex-row w-full mt-10 `)}>
            <View style={tw(`text-xs flex flex-col gap-5`)}>
              <Text>Name: {data.name}</Text>
              <Text>Date: {data.date}</Text>
              <Text>Place: {data.place}</Text>
            </View>
            <View style={tw(`flex flex-col gap-8 justify-center items-center`)}>
              <Image
                source={{
                  uri: data.signatureUrl,
                }}
                style={tw(`w-40 h-24 object-contain`)}
              />
              <Text style={tw(`text-xs flex flex-col gap-5`)}>Signature</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default Page4;
