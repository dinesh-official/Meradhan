import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import ReturnsCalculation from "./elements/ReturnsCalculation";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";

function ReturnsCalculationSection() {
  return (
    <SectionWrapper className="bg-accent">
      <div className="container">
        <SectionTitleDesc
          title={
            <>
              <span className="font-semibold text-secondary">Returns</span>{" "}
              Calculation
            </>
          }
        />
        <ReturnsCalculation />
      </div>
    </SectionWrapper>
  );
}

export default ReturnsCalculationSection;
