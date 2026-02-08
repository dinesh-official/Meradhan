import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { BondListCard } from "@/global/components/Bond/BondListCard";
import { BondDetailsResponse } from "@root/apiGateway";

function LatestBondReleases({ bonds }: { bonds: BondDetailsResponse[] }) {
  return (
    <SectionWrapper>
      <div className="flex flex-col gap-5 container">
        <SectionTitleDesc
          title={
            <>
              <span className="font-semibold text-secondary">Latest</span> Bond
              Releases
            </>
          }
          description="New bonds are in! See what’s just been released in the market."
        />
        <div className="gap-5 grid lg:grid-cols-3 mt-2">
          {bonds && bonds.length > 0 ? (
            bonds.map((bond) => (
              <BondListCard
                key={bond.id}
                data={bond}
                gridMode={true}
                onlyShare
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-muted-foreground text-center">
              No bonds available at the moment.
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}

export default LatestBondReleases;
