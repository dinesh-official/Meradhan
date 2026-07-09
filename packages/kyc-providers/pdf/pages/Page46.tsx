import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";

import TextList from "../elements/TextList";

function Page46() {
  return (
    <View
      style={tw(
        `w-[90%] px-4 mx-auto  text-xs flex flex-col gap-2 leading-6 mt-5`
      )}
    >
      <TextList count="c.">
        I confirm that BondNest may disclose or report my personal and financial
        information if and when required under applicable law or directions of
        regulatory authorities. I further consent that BondNest may share such
        information with its employees, agents, representatives, advisers,
        auditors, consultants, service providers/vendors (with whom BondNest has
        contractual arrangements), sub-contractors, affiliated entities within
        BondNest, or with my authorised adviser/agent, where directed, for
        transactional, compliance, or marketing purposes.
      </TextList>
      <Text style={tw(`font-[600]`)}>
        11. Other Declarations and Representations
      </Text>
      <TextList count="a.">
        Neither I nor my representatives have ever been subject to disciplinary
        or criminal proceedings, nor have we been notified of any such pending
        or impending action or investigation which may lead to such proceedings.
      </TextList>
      <TextList count="b.">
        Neither I nor my representatives have been convicted of, or alleged to
        have committed, any offence involving dishonesty, gross negligence,
        incompetence, fraud, wilful misconduct, moral turpitude, economic
        offence, or any violation/alleged violation of securities laws,
        including market manipulation.
      </TextList>
      <TextList count="c.">
        No inquiry or order for winding up or insolvency has ever been passed
        against me.
      </TextList>
      <TextList count="d.">
        No order of suspension, cancellation, restraint, prohibition, or
        debarment from dealing in securities or from accessing the capital
        markets has been passed against me or my representatives by the
        Securities and Exchange Board of India (SEBI) or any other regulatory
        authority.
      </TextList>
      <TextList count="e.">
        Neither I nor my representatives have entered into any compositions or
        arrangements with creditors, nor have we defaulted in repayment of
        existing obligations.
      </TextList>
      <TextList count="f.">
        I declare that the information, details, and documents furnished at the
        time of empanelment are true and correct. I undertake to promptly update
        BondNest in case of any change to such details, documents, or
        information submitted.
      </TextList>
      <TextList count="g.">
        I undertake to comply with all applicable laws, conflict-of-interest
        guidelines, and codes of conduct applicable to my obligations in
        relation to transactions executed through BondNest.
      </TextList>
      <TextList count="h.">
        Anti-Bribery and Corruption: I represent, warrant, and undertake that I
        do not and shall not, directly or indirectly, offer, promise, give,
        solicit, receive, or otherwise engage in any act of bribery or
        corruption in relation to this arrangement/empanelment (including
        facilitation payments), or to obtain or retain business or any advantage
        in business for myself, my af filiates, or family members. I further
        confirm that my representatives and related parties under my direction
        or control shall adhere to the same.
      </TextList>
      <Text style={tw(`pl-[18px]`)}>
        For the purposes of this clause, it is immaterial whether the bribery or
        corruption is:
      </Text>
      <View style={tw(`flex flex-col gap-3 ml-4`)}>
        <TextList count="i)">direct or through a third party;</TextList>
        <TextList count="ii)">
          of a public official or a private person;
        </TextList>

        <TextList count="iii)">financial or in any other form; or</TextList>
        <TextList count="iv)">
          relates to past, present, or future performance or non-performance of
          a function or activity, whether in an official capacity or not.
        </TextList>
      </View>
    </View>
  );
}

export default Page46;
