import { Image, Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page47({
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
    <View
      style={tw(
        `w-[90%] px-4 mx-auto mt-4 text-xs flex flex-col gap-3 leading-6`
      )}
    >
      <Text>
        For this purpose, “person” means any individual, partnership, company,
        or other legal entity, public or private. I shall immediately notify
        BondNest upon becoming aware of any non-compliance with this clause. Any
        breach of this condition shall be deemed incapable of remedy.
      </Text>
      <TextList count="i.">Other Confirmations</TextList>
      <View style={tw(`flex flex-col gap-3 pl-4`)}>
        <TextList count="i)">
          I understand that investments in capital and securities markets
          involve inherent risks. I shall be solely responsible for any losses
          or adverse consequences arising from such investments.
        </TextList>
        <TextList count="ii)">
          BondNest reserves the right to review and modify the terms of
          empanelment at its sole discretion.
        </TextList>
        <TextList count="iii)">
          Documents sent by BondNest electronically — by email (including
          auto-responses), attachments, SMS, electronic communication, or via
          download options on platforms owned/operated/licensed by BondNest —
          shall be deemed sufficient for compliance with any delivery obligation
          (legal or otherwise).
        </TextList>
        <TextList count="iv)">
          The terms and conditions specified in the Order Receipt, Deal Sheet,
          Contract Note(s), and other transaction documents issued by BondNest
          shall form an integral part of this arrangement and be binding upon
          me.
        </TextList>
        <TextList count="v)">
          BondNest reserves the right to terminate the empanelment without
          assigning any reason and without prior notice.
        </TextList>
        <TextList count="vi)">
          All dealings and transactions with BondNest shall be governed by and
          construed in accordance with the laws of India.
        </TextList>
        <TextList count="vii)">
          Under no circumstances shall BondNest, its affiliates, directors,
          officers, employees, agents, licensors, consultants, or contractors be
          liable to me or any third party for any indirect, incidental, special,
          consequential, or punitive damages, including loss of data, profits,
          goodwill, or other intangible losses arising in any manner.
        </TextList>
      </View>
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

export default Page47;
