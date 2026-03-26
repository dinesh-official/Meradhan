import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";


function Page41() {
  return (
    <View style={tw(`w-[90%] px-4 mx-auto mt-4 text-xs flex flex-col gap-3 `)}>
      <TextList count="1.">
        The nomination can be made only by individuals applying for/holding
        units on their own behalf singly or jointly.
      </TextList>
      <TextList count="2.">
        Non-individuals including a Society, Trust, Body Corporate, Partnership
        Firm, Karta of Hindu undivided family, a Power of Attorney holder and/or
        Guardian of Minor unitholder cannot nominate.
      </TextList>
      <TextList count="3.">
        Nomination is not allowed in a folio of a Minor unitholder.
      </TextList>
      <TextList count="4.">
        If the units are held jointly (i.e., in case of multiple unitholders in
        the folio), all joint holders need to sign the Nomination Form (even if
        the mode of holding/operation is on “Anyone or Survivor” basis)
      </TextList>
      <TextList count="4.">
        If the units are held jointly (i.e., in case of multiple unitholders in
        the folio), all joint holders need to sign the Nomination Form (even if
        the mode of holding/operation is on “Anyone or Survivor” basis)
      </TextList>
      <TextList count="5.">
        A minor may be nominated. In that event, the name and address of the
        Guardian of the minor nominee needs to be provided.
      </TextList>
      <TextList count="6.">
        Nomination can also be in favour of the Central Government, State
        Government, a local authority, any person designated by virtue of his
        office or a religious or charitable trust.
      </TextList>
      <TextList count="7.">
        The Nominee shall not be a trust (other than a religious or charitable
        trust), society, body corporate, partnership firm, Karta of Hindu
        Undivided Family or a Power of Attorney holder.
      </TextList>
      <TextList count="8.">
        A Non-Resident Indian may be nominated subject to the applicable
        exchange control regulations.
      </TextList>
      <TextList count="9.">
        <Text style={tw(`font-[600]`)}>Multiple Nominees:</Text> Nomination can
        be made in favour of multiple nominees, subject to a maximum of ten
        nominees. In case of multiple nominees, the percentage of the
        allocation/share should be in whole numbers without any decimals, adding
        upto a total of 100%. If the total percentage of allocation amongst
        multiple nominees does not add up to 100%, the nomination request shall
        be treated as invalid and rejected. If the percentage of allocation/
        share for each of the nominee is not mentioned, the allocation/claim
        settlement shall be made equally amongst all the nominees.
      </TextList>
      <TextList count="10.">
        Every new nomination for a folio/account shall overwrite the existing
        nomination, if any.
      </TextList>
      <TextList count="11.">
        Nomination made by a unit holder shall be applicable for units held in
        all the schemes under the respective folio / account.
      </TextList>
      <TextList count="12.">
        Nomination shall stand rescinded upon the transfer of units.
      </TextList>
      <TextList count="13.">
        <Text style={tw(`font-[600]`)}>Death of Nominee(s):</Text> In the event
        of the nominee(s) pre-deceasing the unitholder(s), the unitholder/s
        is/are advised to make a fresh nomination soon after the demise of the
        nominee. The nomination will automatically stand cancelled in the event
        of the nominee(s) pre-deceasing the unitholder(s). In case of multiple
        nominations, if any of the nominee is deceased at the time of death
        claim settlement, the said nominee’s share will be distributed equally
        amongst the surviving nominees.
      </TextList>
      <TextList count="14.">
        Transmission of units in favour of a Nominee shall be valid discharge by
        the asset management companv/ Mutual Fund / Trustees against the legal
        heir(s).
      </TextList>
    </View>
  );
}

export default Page41;
