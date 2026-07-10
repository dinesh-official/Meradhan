/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

/* TableItem Component */
function TableItem({
  className = "h-7",
  value,
  showBorderRight = true,
}: {
  className?: string;
  value: string;
  showBorderRight?: boolean;
}) {
  return (
    <View
      style={tw(
        `w-[10%] border-b border-gray-200 flex overflow-hidden text-wrap mt-5 ${
          showBorderRight ? "border-r" : ""
        } ${className}`
      )}
    >
      <Text>{value || ""}</Text>
    </View>
  );
}

type Nominee = {
  Name?: string;
  Share?: string;
  Relationship?: string;
  nomineeSameAsMyAddress?: boolean;
  nomineePostalAddress?: string;
  Mobile?: string;
  Email_ID?: string;
  Identity_Number?: string;
  Date_of_Birth?: string;
  Guardians_Relationship_with_Nominee?: string;
};

function Page38({
  nominees = [],
  defaultAddress = "",
}: {
  nominees?: Nominee[];
  defaultAddress?: string;
}) {
  // Always make 10 rows (real nominees + empty placeholders)
  const rows = [
    ...nominees.map((e) => {
      return {
        name: e.Name,
        share: e.Share,
        relationship: e.Relationship,
        address: e.nomineeSameAsMyAddress
          ? defaultAddress
          : e.nomineePostalAddress,
        mobEmail: e.Mobile + " " + e.Email_ID,
        idNumber: e.Identity_Number,
        dob: e.Date_of_Birth,
        gordian: e.Guardians_Relationship_with_Nominee,
      };
    }),
    ...Array(10 - nominees.length).fill({}),
  ].slice(0, 10);

  return (
    <View style={tw(`w-[90%] px-4 mx-auto  text-xs`)}>
      {/* Header */}
      <View style={tw("bg-main py-2 rounded")}>
        <Text style={tw("text-white font-[500] text-center uppercase")}>
          NOMINATION FORM (ONLY FOR INDIVIDUALS)
        </Text>
      </View>

      {/* Intro Text */}
      <Text style={tw(`mt-3 leading-3`)}>
        I / We hereby nominate the following person(s) who shall receive all the
        assets held in my / our account / folio in the event of my / our demise,
        as trustee and on behalf of my / our legal heir(s) *
      </Text>

      {/* Section Title */}
      <View
        style={tw(`border-t border-gray-200 py-2 text-center mt-2 border-b`)}
      >
        <Text style={tw(`font-[500]`)}>NOMINATION DETAILS</Text>
      </View>

      {/* Table Header */}
      <View style={tw(`flex justify-start flex-row`)}>
        <View style={tw(`w-[15%] h-7 border-b border-gray-200 border-r`)} />
        <View
          style={tw(
            `w-[55%] h-7 border-b border-gray-200 border-r flex justify-center items-center`
          )}
        >
          <Text style={tw(`font-[500] text-[8px]`)}>MANDATORY DETAILS</Text>
        </View>
        <View
          style={tw(
            `w-[30%] h-7 border-b border-gray-200 flex justify-center items-center`
          )}
        >
          <Text style={tw(`font-[500] text-[8px]`)}>
            ADDITIONAL DETAILS****
          </Text>
        </View>
      </View>

      {/* Table Column Names */}
      <View style={tw(`flex justify-start items-center flex-row`)}>
        <TableItem value="" className="py-2 h-11 font-[500] text-center" />
        <TableItem
          value="Name of Nominee"
          className="py-2 w-[16%] h-11 font-[500] text-[7px] text-center"
        />
        <TableItem
          value="Share of Nominee (%)**"
          className="py-2 w-[8%] h-11 font-[500] text-[7px] text-center"
        />
        <TableItem
          value="Relationship"
          className="py-2 w-[11%] h-11 font-[500] text-[7px] text-center"
        />
        <TableItem
          value="Postal Address"
          className="py-2 w-[16%] h-11 font-[500] text-[7px] text-center"
        />
        <TableItem
          value="Mobile Number & E-mail"
          className="py-2 w-[11%] h-11 font-[500] text-[7px] text-center"
        />
        <TableItem
          value="Identity Number ***"
          className="py-2 w-[8%] h-11 font-[500] text-[7px] text-center"
        />
        <TableItem
          value="D.O.B. of Nominee"
          className="py-2 h-11 font-[500] text-[7px] text-center"
        />
        <TableItem
          value="Guardian"
          className="py-2 h-11 font-[500] text-[7px] text-center"
          showBorderRight={false}
        />
      </View>

      {/* Table Rows */}
      {rows.map((nominee: any, i: number) => (
        <View key={i} style={tw(`flex justify-start items-center flex-row`)}>
          <TableItem
            value={`Nominee ${i + 1}`}
            className="p-1 h-9 text-[7px] text-center"
          />
          <TableItem
            value={nominee.name || ""}
            className="p-1 w-[16%] h-9 text-[7px] text-center"
          />
          <TableItem
            value={nominee.share ? `${nominee.share}%` : ""}
            className="p-1 w-[8%] h-9 text-[7px] text-center"
          />
          <TableItem
            value={nominee.relationship || ""}
            className="p-1 w-[11%] h-9 text-[7px] text-center"
          />
          <TableItem
            value={nominee.address || nominee.address || ""}
            className="p-1 w-[16%] h-9 text-[6px] text-center"
          />
          <TableItem
            value={nominee.mobEmail ? nominee.mobEmail : ""}
            className="p-1 w-[11%] h-9 text-[5px] text-center"
          />
          <TableItem
            value={nominee.idNumber || ""}
            className="p-1 w-[8%] h-9 text-[6px] text-center"
          />
          <TableItem
            value={nominee.dob || ""}
            className="p-1 h-9 text-[7px] text-center"
          />
          <TableItem
            value={nominee.gordian || ""}
            className="p-1 h-9 text-[7px] text-center"
            showBorderRight={false}
          />
        </View>
      ))}

      {/* Transmission Aspects */}
      <Text style={tw(`mt-2`)}>* Joint Accounts:</Text>
      <View style={tw(`text-xs mt-3`)}>
        {/* Transmission Table Header */}
        <View style={tw(`border-t border-b flex flex-row border-gray-200`)}>
          <View
            style={tw(
              `w-[50%] border-r border-gray-200 p-2 font-[500] flex justify-center`
            )}
          >
            <Text>Event</Text>
          </View>
          <View style={tw(`w-[50%] flex p-2 justify-center font-[500]`)}>
            <Text>Transmission of Account / Folio to</Text>
          </View>
        </View>

        {/* Transmission Table Rows */}
        {[
          {
            name: "Demise of one or more joint holder(s)",
            value:
              "Surviving holder(s) through name deletion. The surviving holder(s) shall inherit the assets as owners",
          },
          {
            name: "Demise of all joint holders simultaneously – having nominee",
            value: "Nominee",
          },
          {
            name: "Demise of all joint holders simultaneously – not having nominee",
            value: "Legal heir(s) of the youngest holder",
          },
        ].map((row, i) => (
          <View
            key={i}
            style={tw(`border-b mx-auto flex flex-row border-gray-200`)}
          >
            <View style={tw(`w-[50%] border-r border-gray-200 p-2 flex`)}>
              <Text style={{ lineHeight: 0.6 }}>{row.name}</Text>
            </View>
            <View style={tw(`w-[50%] flex p-2`)}>
              <Text style={{ lineHeight: 0.6 }}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footnotes */}
      <View style={tw("text-xs flex flex-col gap-1 mt-3")}>
        <Text>
          ** if % is not specified, then the assets shall be distributed equally
          amongst all the nominees (see table in ‘Transmission aspects’).
        </Text>
        <Text>
          *** Provide only number: PAN or Driving Licence or Aadhaar (last 4).
          Copy of the document is not required.
        </Text>
        <Text>
          **** to be furnished only in following conditions / circumstances
        </Text>
        <TextList count="•" fontSize={9}>
          Date of Birth (DoB): please provide, only if the nominee is minor.
        </TextList>
        <TextList count="•" fontSize={9}>
          Guardian: It is optional for you to provide, if the nominee is minor.
        </TextList>
      </View>
    </View>
  );
}

export default Page38;
