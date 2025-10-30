import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import DhanGptHeroInput from "./elements/DhanGptHeroInput";
import IWantToQus from "./elements/IWantToQus";

function HomeHeroSection() {
  return (
    <div className="w-full lg:h-[520px] py-8 bg-primary flx flex-col justify-center items-center">
      <div className="container text-center text-white h-full">
        <div className="flex flex-col gap-5 h-full justify-center">
          <h1
            className={cn(
              "lg:text-[40px] text-3xl font-medium",
              quicksand.className
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
          <p className="mt-3 ">
            Or answer the following questions to let MeraDhan guide you!
          </p>

          <IWantToQus />
        </div>
      </div>
    </div>
  );
}

export default HomeHeroSection;
