import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import { CheckBoxRow } from "../elements/CheckBoxRow";
import TextFiled from "../elements/TextFiled";

function Page12({
  annualGrossIncome = "",
  nameOfStockBroker = "",
  subBroker = "",
  clientCode = "",
  exchanges = "",
  website = "",
  detailsOfDisputes = "NILL",
  investmentExperience = "",
}: {
  annualGrossIncome?: string;
  nameOfStockBroker?: string;
  subBroker?: string;
  clientCode?: string;
  exchanges?: string;
  website?: string;
  detailsOfDisputes?: string;
  investmentExperience?: string;
}) {
  return (
    <View style={tw("px-4")}>
      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          4. Dealing through other Stock Broker
        </Text>
      </View>

      <View style={tw(`w-[90%] mx-auto flex flex-col gap-2  mt-4 text-xs`)}>
        <Text>
          Are you currently dealing with any other stock broker or sub-brokers?
          If yes, please provide the details of all such brokers.
        </Text>
        <TextFiled
          title="Name of Stock Broker:"
          value={nameOfStockBroker}
          className="pr-12"
        />
        <TextFiled
          title="Sub-Broker (if any):"
          value={subBroker}
          className="pr-10"
        />
        <TextFiled title="Client Code:" value={clientCode} className="pr-5" />
        <TextFiled title="Exchange(s):" value={exchanges} className="pr-5" />
        <TextFiled title="Website:" value={website} className="pr-8" />
        <TextFiled
          title={`Details of disputes/dues pending
from/to such stock broker`}
          value={" "}
          className="flex-wrap pr-24 leading-2.5"
        />
      </View>

      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          5. Settlement Agency*
        </Text>
      </View>
      <View style={tw(`w-[90%] mx-auto flex flex-col gap-3  mt-4 text-xs`)}>
        <View style={tw(`flex flex-row gap-20`)}>
          <CheckBoxRow label="NSCCL" checked />
          <CheckBoxRow label="ICCL" checked />
          <CheckBoxRow label="OFF Market" />
        </View>
      </View>

      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          6. Annual Gross Income
        </Text>
      </View>
      <View style={tw(`w-[90%] mx-auto flex flex-col gap-3  mt-4 text-xs`)}>
        <View style={tw(`flex flex-row gap-11`)}>
          <CheckBoxRow
            label="Below 1 Lac"
            checked={annualGrossIncome == "0-1L"}
          />
          <CheckBoxRow
            label="1 Lac to 5 Lac"
            checked={annualGrossIncome == "1-5L"}
          />
          <CheckBoxRow
            label="5 Lac to 10 Lac"
            checked={annualGrossIncome == "5-10L"}
          />
          <CheckBoxRow
            label="10 Lac to 25 Lac"
            checked={annualGrossIncome == "10-25L"}
          />
          <CheckBoxRow
            label="Above 25 Lac"
            checked={annualGrossIncome == "25L+"}
          />
        </View>
        <View style={tw(`flex flex-row gap-4 w-full`)}>
          <View style={tw(`w-[30%]`)}>
            <TextFiled title={`Or Net Worth`} value=" " className="pr-14" />
          </View>
          <View style={tw(`w-[28%]`)}>
            <TextFiled title={`as on date`} value=" " className="pr-14" />
          </View>
          <Text>(net worth should not be older than 1 year)</Text>
        </View>
      </View>

      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          7. Investment Experience
        </Text>
      </View>
      <View style={tw(`w-[90%] mx-auto flex flex-col gap-3  mt-4 text-xs`)}>
        <View style={tw(`flex flex-row gap-20`)}>
          <CheckBoxRow label="None" checked={investmentExperience == "None".toLocaleLowerCase()} />
          <CheckBoxRow
            label="Upto 1 year"
            checked={investmentExperience == "Up to 1 year".toLocaleLowerCase()}
          />
          <CheckBoxRow
            label="1 to 5 years"
            checked={investmentExperience == "1 – 5 years".toLocaleLowerCase()}
          />
          <CheckBoxRow
            label="Above 5 years"
            checked={investmentExperience == "More than 5 years".toLocaleLowerCase()}
          />
        </View>
      </View>

      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          8. Past Actions
        </Text>
      </View>
      <View style={tw(`w-[90%] mx-auto flex flex-col gap-3  mt-4 text-xs`)}>
        <Text style={tw(`leading-3`)}>
          Provide details of any actions, proceedings, or investigations
          initiated, pending, or taken by SEBI, Stock Exchanges, or any other
          regulatory authority against the applicant/constituent or its
          partners, promoters, whole-time directors, or authorized persons
          responsible for securities dealings during the last 3 years.
        </Text>
        <Text>Details: {detailsOfDisputes}</Text>
      </View>
    </View>
  );
}

export default Page12;
