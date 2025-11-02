import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";

function LatestBondReleases() {
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
          {/* <BondListCard
          
            gridMode={true} onlyShare></BondListCard>
          <BondListCard gridMode={true} onlyShare></BondListCard>
          <BondListCard gridMode={true} onlyShare></BondListCard> */}
        </div>
      </div>
    </SectionWrapper>
  );
}

export default LatestBondReleases;
