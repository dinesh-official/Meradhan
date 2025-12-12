import { cn } from "@/lib/utils";

const MissionVisionSection = () => {
  return (
    <section className="bg-[#ebf6ff] mt-16">
      <div className="container">
        <div className="py-12 md:py-16">
          <div className="flex md:flex-row flex-col items-center gap-8 md:gap-12">
            <div className="flex w-full md:w-2/5">
              <img
                src="/static/target_meradhan.png"
                alt="Mission target"
                width={260}
                height={260}
                className="w-[64px] md:w-[260px] h-[64px] md:h-auto"
              />
            </div>

            <div className="w-full md:w-3/5">
              <h2
                className={cn(
                  "font-medium text-slate-900 text-3xl md:text-4xl",
                  "quicksand-medium"
                )}
              >
                Our{" "}
                <span className="font-semibold text-[#F25C4C]">Mission</span>
              </h2>
              <p className="mt-4 text-slate-700 leading-relaxed">
                At MeraDhan, our mission is to democratize access to fixed
                income investments by educating, guiding, and enabling investors
                across India. We strive to create an ecosystem where every
                individual— regardless of financial background—can confidently
                participate in the bond market to build wealth and secure
                financial stability.
              </p>
            </div>
          </div>

          <div className="my-10 md:my-14" />

          <div className="flex md:flex-row-reverse flex-col items-center gap-8 md:gap-12">
            <div className="flex w-full md:w-2/5">
              <img
                src="/static/ideaLamp-meradhan.png" // swap to your bulb art path
                alt="Vision bulb"
                width={260}
                height={260}
                className="w-[64px] md:w-[260px] h-[64px] md:h-auto"
              />
            </div>

            <div className="w-full md:w-3/5">
              <h2
                className={cn(
                  "font-medium text-slate-900 text-3xl md:text-4xl",
                  "quicksand-medium"
                )}
              >
                Our <span className="font-semibold text-[#F25C4C]">Vision</span>
              </h2>
              <p className="mt-4 text-slate-700 leading-relaxed">
                We envision a financially empowered India where fixed income
                investments are a core component of every investor’s portfolio.
                MeraDhan aims to be the most trusted and user-friendly fixed
                income investment platform, fostering financial literacy,
                transparency, and accessibility in the Indian bond market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVisionSection;
