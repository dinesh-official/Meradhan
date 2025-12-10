import { cn } from "@/lib/utils";

const coreValues = [
  {
    id: 1,
    title: "Financial Education First",
    desc: "We believe in empowering investors with knowledge. MeraDhan is committed to providing easy-to-understand, high-quality content and resources to make fixed income investing accessible to all.",
    icon: "/static/financial_Education.png",
  },
  {
    id: 2,
    title: "Trust & Transparency",
    desc: "Integrity is at the heart of our operations. We ensure clear, unbiased information and seamless transactions so investors can make well-informed decisions.",
    icon: "/static/trust_Transparency.png",
  },
  {
    id: 3,
    title: "Innovation & Accessibility",
    desc: "We leverage cutting-edge technology to simplify bond investing, making it accessible to a diverse range of investors—from beginners to experts.",
    icon: "/static/innovation_accessibility.png",
  },
  {
    id: 4,
    title: "Investor-Centric Approach",
    desc: "Our platform is built for investors, by experts. Every feature, service, and educational resource is tailored to provide a superior user experience.",
    icon: "/static/investor-centric.png",
  },
  {
    id: 5,
    title: "Long-Term Wealth Creation",
    desc: "We advocate sustainable and stable investment opportunities, helping individuals build long-term wealth with fixed income instruments.",
    icon: "/static/long_term.png",
  },
];

const CoreValuesSection = () => {
  return (
    <section className="justify-center items-center gap-4 space-y-6 mt-[4rem] px-5 text-gray-800 leading-relaxed container">
      <h4
        className={cn(
          "font-medium text-black text-3xl md:text-4xl",
          "quicksand-medium"
        )}
      >
        Core <span className="font-semibold text-[#F25C4C]">Values</span>
      </h4>

      <div className="space-y-10 mt-8">
        {coreValues.map((item) => (
          <div key={item.id} className="flex md:flex-row flex-col gap-6">
            <div className="flex-shrink-0">
              <img
                src={item.icon}
                alt={item.title}
                width={100}
                height={100}
                className="w-[90px] md:w-[110px] h-[90px] md:h-[110px]"
              />
            </div>
            <div className="flex flex-col gap-2 md:text-left">
              <h4 className="font-semibold text-lg md:text-xl">{item.title}</h4>
              <p className="text-sm md:text-base">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoreValuesSection;
