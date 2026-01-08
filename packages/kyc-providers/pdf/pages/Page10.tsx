import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

const TableData1 = [
  {
    sno: 1,
    name: "Account Opening Form",
    value: `A. KYC Form - Document captures the basic information about the constituent and an instruction/checklist. 

B. Document captures the additional information about the constituent relevant to trading account and an instruction / checklist`,
  },
  {
    sno: 2,
    name: "Rights and Obligations",
    value: `Document stating the Rights & Obligations of stock broker and client for trading on exchanges (including additional rights & obligations in case of internet/wireless technology based).
`,
  },
  {
    sno: 3,
    name: "Risk Disclosure Document (RDD)",
    value: `Document detailing risks associated with dealing in the securities market.`,
  },
  {
    sno: 4,
    name: "Guidance Note",
    value:
      "Document detailing do's and dont's for trading on stock exchange for education of investors.",
  },
  {
    sno: 5,
    name: "Policies and Procedures",
    value:
      "Document describing significant policies and procedures of the stock broker",
  },
  {
    sno: 6,
    name: "Tariff Sheet",
    value:
      "Document detailing the rate/amount of brokerage and other charges levied on the client for trading on the stock exchange(s)",
  },
];

const TableData2 = [
  // {
  //   sno: 7,
  //   name: "Nomination Form",
  //   value: `Nomination form for the Trading account`,
  // },
  {
    sno: 7,
    name: "General Terms & Conditions and Other Authorisation",
    value: `General Terms & Conditions and authorisations for trading in debt instruments, covering client responsibilities, regulatory compliance, and consent for communications.`,
  },
];

function Page10() {
  return (
    <View style={tw(`px-4`)}>
      {/* Table Section */}
      <View style={tw(`mt-4 text-xs`)}>
        <View style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  ")}>
          <Text
            style={tw(
              "text-xs text-white font-[500] leading-[1px] text-center "
            )}
          >
            ACCOUNT OPENING KIT
          </Text>
        </View>
        <Text style={tw(`font-[600] uppercase text-[9px] text-center py-2`)}>
          INDEX
        </Text>

        <View
          style={tw(
            `w-[90%] border-t border-b mx-auto flex flex-row border-gray-200 `
          )}
        >
          <View
            style={tw(
              `w-[10%] border-r border-gray-200 p-2  font-[600] flex justify-center`
            )}
          >
            <Text>Sr. No.</Text>
          </View>
          <View
            style={tw(
              `w-[30%] border-r border-gray-200 p-2 font-[600]   flex justify-center`
            )}
          >
            <Text>Name of the Document</Text>
          </View>
          <View style={tw(`w-[60%] flex p-2 justify-center font-[600] `)}>
            <Text>Brief Significance of the Document</Text>
          </View>
        </View>
        <Text style={tw(`font-[600] uppercase text-xs text-center py-3`)}>
          Mandatory Documents as Prescribed by SEBI & Exchanges
        </Text>

        {TableData1.map((e, i) => {
          return (
            <View
              style={tw(
                `w-[90%]  border-b mx-auto flex flex-row border-gray-200 text-xs  ${i == 0 && "border-t"
                }`
              )}
            >
              <View style={tw(`w-[10%] border-r border-gray-200 p-2 flex `)}>
                <Text style={{ lineHeight: 0.6 }}>{e.sno}</Text>
              </View>
              <View style={tw(`w-[30%] border-r border-gray-200 p-2  flex `)}>
                <Text style={{ lineHeight: 0.6 }}>{e.name}</Text>
              </View>
              <View style={tw(`w-[60%] flex p-2 `)}>
                <Text style={{ lineHeight: 0.6 }}>{e.value}</Text>
              </View>
            </View>
          );
        })}
        <Text style={tw(`font-[600] uppercase text-[7px] text-center py-2`)}>
          Voluntary (Optional) Documents as Provided by the Stock Broker
        </Text>
        {TableData2.map((e, i) => {
          return (
            <View
              style={tw(
                `w-[90%]  border-b mx-auto flex flex-row border-gray-200 text-xs ${i == 0 && "border-t"
                }`
              )}
            >
              <View style={tw(`w-[10%] border-r border-gray-200 p-2 flex `)}>
                <Text style={{ lineHeight: 0.6 }}>{e.sno}</Text>
              </View>
              <View style={tw(`w-[30%] border-r border-gray-200 p-2  flex `)}>
                <Text style={{ lineHeight: 0.6 }}>{e.name}</Text>
              </View>
              <View style={tw(`w-[60%] flex p-2 `)}>
                <Text style={{ lineHeight: 0.6 }}>{e.value}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={tw(`w-[90%] mx-auto text-xs flex flex-col gap-2 mt-3`)}>
        <View style={tw(`flex gap-2 flex-row`)}>
          <Text style={tw(`font-[600]`)}>Name of stock-broker:</Text>
          <Text>
            BondNest Capital India Securities Private Limited (hereinafter
            referred to as “BondNest”)
          </Text>
        </View>
        <View style={tw(`flex flex-row gap-4 flex-between`)}>
          <View style={tw(`flex gap-3 flex-row`)}>
            <Text style={tw(`font-[600]`)}>SEBI Registration Number:</Text>
            <Text>INZ000330234</Text>
          </View>
          <View style={tw(`flex gap-3 flex-row`)}>
            <Text style={tw(`font-[600]`)}>NSE Trading Member:</Text>
            <Text>90480</Text>
          </View>
          {/* <View style={tw(`flex gap-3 flex-row`)}>
            <Text style={tw(`font-[600]`)}>BSE Trading Member:</Text>
            <Text>XXXXXXX</Text>
          </View> */}
        </View>
        <View style={tw(`flex gap-3 flex-row`)}>
          <Text style={tw(`font-[600]`)}>Registered Office:</Text>
          <Text>
            2703, Ashok Tower 'D', Dr. SSR Marg, Parel, Mumbai- 400012,
            Maharashtra
          </Text>
        </View>
        <View style={tw(`flex gap-3 flex-row w-full`)}>
          <Text style={tw(`font-[600]`)}>Correspondence Office:</Text>
          <Text style={[tw(`w-[80%]`), { lineHeight: 0.8 }]}>
            TBQ, Suite No 511, 5th floor, Tower 2A, North Annex, One World
            Centre, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013
            (India)
          </Text>
        </View>
        <View style={tw(`flex gap-3 flex-row`)}>
          <Text style={tw(`font-[600]`)}>Compliance Officer:</Text>
          <Text style={{ lineHeight: 0.8 }}>
            Ms. Deepa Shah, Mobile: +91 9845432677, Email ID:
            compliance@meradhan.co
          </Text>
        </View>
        <Text style={{ lineHeight: 1.3, fontSize: 8 }}>
          For any grievances please contact at the above address or email at
          compliance@meradhan.co & Phone no. +919845432677. In case not
          satisfied with the response, please contact the concerned exchange at
          NSE: ignse@nse.co.in or contact at 022-26598100 or BSE:
          is@bseindia.com or contact at 022-22728097
        </Text>
        <Text style={{ lineHeight: 1.3, fontSize: 8 }}>
          The complaint not redressed at Stock Broker / Stock Exchange level,
          may be lodged with SEBI on SCORES at https://scores.sebi.gov.in or
          SMART ODR PORTAL: https://smartodr.in/login
        </Text>
      </View>
    </View>
  );
}

export default Page10;
