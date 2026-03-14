import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FaCheck } from "react-icons/fa";
import DhanGptHeroInput from "./elements/DhanGptHeroInput";
import Squares from "./elements/Squares";

const FEATURE_BADGES = [
  "Listed Bonds",
  "8 - 12% Fixed Returns",
  "Sell Anytime",
] as const;

function HomeHeroSection() {
  return (
    <SectionWrapper className="relative flex flex-col justify-center items-center bg-primary py-16 md:py-20 w-full overflow-hidden">
      <Squares
        direction="diagonal"
        speed={0.2}
        squareSize={40}
        borderColor="#0C4580"
        hoverFillColor="#2D69A426"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="relative z-10 h-full text-white text-center container px-4">
        <div className="flex flex-col justify-center items-center gap-5 md:gap-6 h-full mx-auto">
          {/* 1. SEBI badge – shield with white checkmark inside */}
          <div className="flex items-center justify-center gap-1.5">
            <span className="relative inline-flex shrink-0 w-5 h-[21px] items-center justify-center">
              <Image
                src="/assets/shild.svg"
                alt=""
                width={20}
                height={21}
                className="absolute inset-0 w-5 h-[21px] object-contain"
              />
              <FaCheck className="relative z-10 w-2.5 h-2.5 text-white shrink-0" aria-hidden />
            </span>
            <span className="text-white text-sm font-normal tracking-tight">
              SEBI Registered Stock Broker
            </span>
          </div>

          {/* 2. Headline – large, bold */}
          <h1
            className={cn(
              "text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl leading-tight text-center",
              "quicksand-semibold"
            )}
          >
            <span className="text-secondary">AI-Powered</span>{" "}
            <span className="text-white">Fixed Income Investment Platform</span>
          </h1>

          {/* 3. Feature badges – thin white border, consistent spacing */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {FEATURE_BADGES.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/90 text-white text-sm font-normal"
              >
                <FaCheck className="size-4 shrink-0 text-white" aria-hidden />
                {label}
              </span>
            ))}
          </div>

          {/* 4. Supporting line */}
          <p className="text-white text-lg font-normal">
            Bonds sound confusing? MeraDhan-GPT&apos;s got your back!
          </p>

          {/* 5. DhanGPT input – wide, prominently rounded */}
          <div className="w-full mt-1">
            <DhanGptHeroInput />
          </div>
        </div>
      </div>

    </SectionWrapper>
  );
}

export default HomeHeroSection;
