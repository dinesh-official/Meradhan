import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import BondsByCategories from "@/global/components/Bond/BondsByCategories";
import { BondDetailResponse, ISessionResponse } from "@root/apiGateway";
import BondInfoHeader from "./BondInfoHeader";
import BondDetailTabs from "./BondDetailTabs";

type Bond = BondDetailResponse["responseData"];

export default function BondIsinView({
  bond,
  session,
}: {
  bond: Bond;
  session?: ISessionResponse["responseData"] | null;
}) {
  return (
    <div className="py-10">
      <BondInfoHeader bond={bond} />
      <BondDetailTabs bond={bond} session={session} />

      <div className="container">
        <SectionWrapper>
          <BondsByCategories />
        </SectionWrapper>
      </div>
    </div>
  );
}
