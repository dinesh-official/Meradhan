import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { cn } from "@/lib/utils";
import DhanGptHeroInput from "./elements/DhanGptHeroInput";

function HomeHeroSection() {
  return (
    <SectionWrapper className="flex-col justify-center items-center bg-primary py-[60px] w-full flx">
      <div className="h-full text-white text-center container">
        <div className="flex flex-col justify-center gap-5 h-full">
          <h1 className={cn("lg:text-[44px] text-3xl", "quicksand-medium")}>
            <span className="text-secondary quicksand-semibold">
              AI-Powered
            </span>{" "}
            Fixed Income Investment Platform
          </h1>
          <p>Bonds sound confusing? DhanGPT’s got your back!</p>
          <DhanGptHeroInput />
          {/* <p className="mt-3">
            Or answer the following questions to let MeraDhan guide you!
          </p> */}

          {/* <IWantToQus /> */}
        </div>
      </div>
    </SectionWrapper>
  );
}

export default HomeHeroSection;
