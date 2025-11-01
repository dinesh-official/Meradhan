import { cn } from "@/lib/utils";
import DhanGptHeroInput from "./elements/DhanGptHeroInput";
import IWantToQus from "./elements/IWantToQus";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";

function HomeHeroSection() {
  return (
    <SectionWrapper className="flex-col justify-center items-center bg-primary py-8 w-full lg:h-[520px] flx">
      <div className="h-full text-white text-center container">
        <div className="flex flex-col justify-center gap-5 h-full">
          <h1
            className={cn(
              "font-medium lg:text-[40px] text-3xl",
              "quicksand-medium"
            )}
          >
            <span className="text-secondary">AI-Powered</span> Fixed Income
            Investment Platform
          </h1>
          <p>
            Bonds confusing? Buy, sell, or just bond with knowledge—DhanGPT’s
            got your back!
          </p>
          <DhanGptHeroInput />
          <p className="mt-3">
            Or answer the following questions to let MeraDhan guide you!
          </p>

          <IWantToQus />
        </div>
      </div>
    </SectionWrapper>
  );
}

export default HomeHeroSection;
