import { Image, Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";

function Page48({
  name = "",
  place = "",
  date = "",
  signatureUrl = "",
}: {
  name?: string;
  place?: string;
  date?: string;
  signatureUrl?: string;
}) {
  return (
    <View style={tw(`w-[90%] px-4 mx-auto mt-4 text-xs flex flex-col gap-3`)}>
      <Text style={tw(`text-center font-[600] uppercase mt-3 mb-3 text-sm`)}>
        ACKNOWLEDGEMENT
      </Text>
      <View style={tw(`flex flex-row mt-3 justify-between`)}>
        <Text style={tw(`leading-3 `)}>
          {`To,
BondNest Capital India Securities Private Limited
TBQ, Suite No 511,
5th floor, Tower 2A, North Annex
One World Centre, Senapati Bapat Marg,
Lower Parel, Mumbai, Maharashtra 400013`}
        </Text>
      </View>
      <Text style={tw(`leading-[5px]`)}>
        I acknowledge having received the following documents and confirm that I
        have read and understood all their clauses.
      </Text>

      <View style={tw(`mt-4`)}>
        <View
          style={tw(
            `border-t border-b border-gray-200 flex flex-row py-2.5 pt-1.5`
          )}
        >
          <Text style={tw(`w-[20%] font-[600]`)}>Sr. No.</Text>
          <Text style={tw(`font-[600]`)}>Summary of Document Significance</Text>
        </View>

        {[
          "Duly Completed and Signed KYC Copy",
          "Rights and Obligations",
          "Risk Disclosure document (RDD) for Capital, Derivatives, and Currencies Segments",
          "Guidance Note - Do's and Dont's for trading on the Exchange(s) for investors",
          "Policies and Procedures ",
          "Tariff Sheet",
          // "Nomination Declaration Form (whether opted or not)",
          "General Terms & Conditions and Other Authorisation",
        ].map((e, i) => {
          return (
            <View
              style={tw(`border-b border-gray-200 flex flex-row py-2.5 pt-1.5`)}
            >
              <Text style={tw(`w-[20%] px-2`)}>{i + 1}</Text>
              <Text>{e}</Text>
            </View>
          );
        })}
      </View>
      <Text style={tw(`leading-3 mt-4`)}>
        I also confirm that I have received all relevant clarifications,
        wherever required, from the officials of BondNest.
      </Text>
      <View style={tw(`flex flex-row mt-8 justify-between`)}>
        <View style={tw(`flex flex-col gap-3 text-xs`)}>
          <Text>Name: {name}</Text>
          <Text>Place: {place}</Text>
          <Text>Date: {date}</Text>
        </View>
        <View style={tw(`flex flex-col gap-8 justify-center items-center`)}>
          <Image
            src={signatureUrl ? signatureUrl : ""}
            style={tw(`w-40 h-24 object-contain`)}
          />
          <Text style={tw(`text-xs flex flex-col gap-5`)}>Signature</Text>
        </View>
      </View>
    </View>
  );
}

export default Page48;
