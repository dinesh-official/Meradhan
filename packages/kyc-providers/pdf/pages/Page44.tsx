import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page44({ email }: { email: string }) {
  return (
    <View
      style={tw(
        `w-[90%] px-4 mx-auto mt-4 text-xs flex flex-col gap-3 leading-6`,
      )}
    >
      <TextList count="h.">
        I understand and agree that BondNest may share my information and
        documents, as required for debt products, with the respective RTAs
        and/or Stock Exchanges through secure channels. I agree that BondNest
        shall not be liable for any disclosure resulting from transmission
        errors, unauthorised third-party access, or causes beyond its reasonable
        control.
      </TextList>
      <TextList count="i.">
        I understand and agree that BondNest shall not be liable for any loss or
        damages suffered by me on account of interruption, malfunction,
        downtime, non-availability, or error of the platform, or failure in the
        execution of any transaction, including NAV-related issues. Further,
        where clear funds are not available in the Company’s account, my
        transaction may remain unexecuted and BondNest shall not be held liable
        in such circumstances.
      </TextList>
      <TextList count="j.">I acknowledge that:</TextList>
      <View style={tw(`ml-4 flex flex-col gap-3`)}>
        <TextList count="i)">
          Unless otherwise modified, the RFQ platform of the Stock Exchanges
          shall be available from 9:00 AM to 5:00 PM on all working days; and
        </TextList>
        <TextList count="ii)">
          Unless otherwise modified, the reporting platforms of the Stock
          Exchanges shall be operational from 9:00 AM to 5:15 PM, or as may be
          prescribed from time to time.
        </TextList>
      </View>
      <Text style={tw(`font-[600]`)}>
        2. Electronic Deal Sheet / Order Receipt / Quote Receipt Declaration
      </Text>
      <Text>
        I hereby consent to receive from BondNest the digital quote receipt,
        deal sheet, order receipt, bills, ledgers, statements of account,
        notices, circulars, amendments, and such other correspondence, including
        standard documents forming part of the account opening kit. I agree that
        BondNest shall have fulfilled its legal obligations if such documents
        are provided electronically.
      </Text>
      <View>
        <View style={tw(`flex flex-row gap-4 justify-start items-start`)}>
          <Text>I further confirm that my email address is </Text>
          <View style={tw(`border-b border-gray-200  w-[40%]`)}>
            <Text> {email} </Text>
          </View>
          <Text>and the same shall be</Text>
        </View>
        <Text>
          treated as my registered email ID in your records. I shall maintain
          secrecy of the login ID and password for the said email account.
          BondNest shall not be responsible for any breach of secrecy. Any email
          sent to the aforesaid email address which does not bounce back shall
          be deemed duly delivered. Out-of-office or similar automated replies
          shall not affect such deemed delivery. I undertake to promptly notify
          BondNest in case of any change in my registered email address.
        </Text>
      </View>
      <Text style={tw(`font-[600]`)}>3. Errors And Omissions</Text>
      <Text>
        I understand and agree that inadvertent errors may occur, while
        executing orders placed by me. In such circumstances BondNest shall make
        all reasonable efforts to rectify the same and ensure that I am not put
        to any monetary loss. I understand and agree that I shall not hold
        BondNest responsible beyond this and claim additional damages/loss.I
        understand and agree that my request to modify or cancel the order shall
        not be deemed to have been executed unless and until the same is
        confirmed by BondNest.{" "}
      </Text>
      <Text style={tw(`font-[600]`)}>4. No Market Manipulation</Text>
      <Text>
        I undertake not to execute transactions, either singly or in concert
        with other clients, which may be viewed as manipulative trades viz.
        artificially raising, depressing or maintaining the price, creation of
        artificial volume, synchronized trades, cross trades, self trades, etc
        or which could be termed as manipulative or fraudulent trades by
        SEBI/Exchanges. In case if I am found to be indulging in such
        activities, BoneNest has every right to inform the Exchange/SEBI/other
        regulatory authority of the same and suspend/close my trading account.
      </Text>
    </View>
  );
}

export default Page44;
