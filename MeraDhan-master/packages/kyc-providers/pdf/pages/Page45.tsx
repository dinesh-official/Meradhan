import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";

import TextList from "../elements/TextList";

function Page45() {
  return (
    <View
      style={tw(
        `w-[90%] px-4 mx-auto  text-xs flex flex-col gap-3 leading-6 mt-5`
      )}
    >
      <Text style={tw(`font-[600]`)}>5. Not Debarred by Any Regulator</Text>
      <Text>
        I confirm and declare that there is no bar on me imposed by any Exchange
        or any regulatory and/or statutory authority to deal in securities
        directly or indirectly. I agree to inform BondNest, in writing, of any
        regulatory action taken by any Exchange or regulatory/ statutory
        authority on me in future. In case if I fail to inform the same and
        BondNest on its own comes to know of such action, BondNest has the right
        to suspend/close my trading account and refuse to deal with me. Also,
        BondNest can at its sole discretion, close all the open positions and
        liquidate collaterals to the extent of trade related debit balances,
        without any notice to me.
      </Text>
      <Text style={tw(`font-[600]`)}>6. PMLA DECLARATION</Text>
      <Text>
        I declare that I have read and understood the contents and the
        provisions of the PMLA Act, 2002, which were also explained to me by
        BondNest officials. I further declare that I shall adhere to all the
        provisions of PMLA Act, 2002. I further undertake and confirm that;
      </Text>
      <TextList count="a.">
        I do not have any links with any known unlawful persons/institutions
      </TextList>
      <TextList count="b.">
        I am a genuine person and not involved or indulge knowingly or assisted,
        directly or indirectly, in any process or activity connected with the
        proceeds of crime nor I am a party to it. The investment money is
        derived from proper means and does not involve any black or Hawala money
        in any manner.
      </TextList>
      <Text style={tw(`font-[600]`)}>7. Authority for intimation</Text>
      <Text>
        I authorise BondNest to send SMS and email to registered email/ mobile
        no. in respect of my account.{" "}
      </Text>
      <Text style={tw(`font-[600]`)}>8. Indemnification</Text>
      <Text>
        I hereby indemnify and hold BondNest, its Directors, associates, group
        and employees harmless from and against all trade related claims,
        demands, actions, proceedings, losses, damages, liabilities, charges
        and/or expenses that are occasioned or may be occasioned to the BondNest
        directly or indirectly, relating to bad delivery of shares/ securities
        and/ or third party delivery, whether authorized or unauthorized and
        fake/forged/stolen shares/ securities/transfer documents introduced or
        that may be introduced by or through me during the course of my
        dealings/ operations on the Exchange(s) and/or proof of address,
        identity and other supporting/ documents provided by me at the time of
        registration and/ or subsequently.{" "}
      </Text>
      <Text style={tw(`font-[600]`)}>
        9. Restriction on Use of Intellectual Property Rights
      </Text>
      <Text>
        I shall not use any trademarks, logos, intellectual property, or other
        proprietary material belonging to BondNest in any manner whatsoever,
        except where I have been specifically authorised in writing by BondNest.
      </Text>
      <Text style={tw(`font-[600]`)}>
        10. Use of Personal Information - Consent and Declarations
      </Text>
      <TextList count="a.">
        I confirm that BondNest shall collect, process, disclose, and use my
        personal and financial information solely for the purpose of providing
        the products and/or services requested by me in the normal course of
        business.
      </TextList>
      <TextList count="b.">
        I confirm that BondNest or its authorised representatives may fetch,
        re-fetch, or validate my KYC/registration documents and other
        credentials from independent third parties, including but not limited to
        CKYC and KRA Portals. I further confirm that BondNest may verify the
        accuracy and completeness of such data whenever required.
      </TextList>
    </View>
  );
}

export default Page45;
