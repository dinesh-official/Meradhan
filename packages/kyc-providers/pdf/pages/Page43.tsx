import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";

import TextList from "../elements/TextList";

function Page43() {
  return (
    <View
      style={tw(
        `w-[90%] px-4 mx-auto mt-5 text-xs flex flex-col gap-3 leading-6`
      )}
    >
      <Text style={tw(`text-center font-[600] uppercase text-sm mt-3 mb-3`)}>
        General Terms and Conditions and Other Authorisation
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

      <Text>
        I wish to trade and/or transact through you as a client in the Debt
        Market segment of NSE, and in order to facilitate ease of operations, I
        hereby authorise BondNest and agree to the General Terms and Conditions
        set out below:
      </Text>
      <Text style={tw(`font-[600]`)}>
        1. Availing Debt Schemes on Exchange Platforms
      </Text>
      <Text>
        I shall avail such debt schemes as are permitted to be dealt with on the
        Exchange Platforms, including the Request for Quote (RFQ) platform of
        NSE (hereinafter collectively referred to as “Exchange Platforms”).
      </Text>
      <TextList count="a.">
        I request you to register me as your client for participation in the
        debt transaction facilities offered by the Exchange Platforms. I shall
        ensure compliance with the requirements as may be prescribed from time
        to time by the Exchange and SEBI. For the purpose of availing such
        facilities, I consent to use of the KYC details as submitted by me for
        stock broking, and confirm that such details remain true and unchanged
        as on date.
      </TextList>
      <TextList count="b.">
        I understand that, at present, stock exchanges are using Real-Time Gross
        Settlement (RTGS) channel as a mode of settlement for trades executed on
        the RFQ platform. I also understand that settlement of trades executed
        on the RFQ platform may be facilitated through payment systems offered
        by banks or payment aggregators duly authorised by the Reserve Bank of
        India, as may be permitted from time to time.
      </TextList>
      <TextList count="c.">
        I shall read and fully understand the contents of the Scheme Related
        Documents, Key Information Memoranda, and any addenda prior to
        transacting in Debt Products.
      </TextList>
      <TextList count="d.">
        I acknowledge that investments in debt instruments are subject to market
        risks, and I shall be solely responsible for all such risks.
      </TextList>
      <TextList count="e.">
        I shall remain liable for any loss (including opportunity loss or
        notional loss), charges, costs, or expenses incurred by me, including
        but not limited to loss relating to Net Asset Value (NAV) due to any
        interruption, malfunction, error, downtime, or other technical glitch of
        the internet/mobile trading platform or any other order routing platform
        of BondNest. I shall have no claim of any nature against BondNest and/or
        its directors, employees, associates, affiliates, or group entities in
        this regard.
      </TextList>
      <TextList count="f.">
        I understand and agree that the role of BondNest is limited to providing
        the online platform to clients. The underlying services and products are
        offered by the respective Corporates, Institutions, or Trusts. I further
        understand and agree that BondNest shall not be liable for any
        differences in price data or execution delays arising out of
        connectivity or system issues.
      </TextList>
      <TextList count="g.">
        I understand and agree that BondNest is an online bond platform only,
        and does not provide investment advice. Neither BondNest nor any of its
        associates, affiliates, or group entities provide recommendations,
        advisory, or solicitation for transactions in debt instruments.
      </TextList>
    </View>
  );
}

export default Page43;
