"use client";
import { cn } from "@/lib/utils";
import React from "react";

function OurExports() {
  return (
    <section className="container">
      <div className="space-y-8 px-5 mt-12 leading-relaxed">
        <h4
          className={cn("font-medium text-3xl md:text-4xl", "quicksand-medium")}
        >
          Experts behind{" "}
          <span className="font-semibold text-[#F25C4C]">MeraDhan</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ExpertProfile
            name="Ajay Mahajan"
            role="CEO & Co-Promoter"
            imageSrc="/avatars/ajay.jpg"
            bio={[
              "Ajay Mahajan brings over three decades of leadership experience in banking, capital markets, and financial services. He has held senior roles at leading global and Indian institutions, including Bank of America, UBS, Yes Bank, IDFC First Bank, and CARE Ratings.",
              "As Managing Director & CEO of CARE Ratings, he led the firm’s strategic shift toward analytics and ESG intelligence. At IDFC First Bank, he built and scaled the wholesale banking division, delivering consistent growth and fostering long-term partnerships with top corporates and global investors. Earlier in his career, Ajay developed UBS India’s institutional banking platform and held key roles across global markets, treasury, and risk management.",
              "At MeraDhan, he brings strategic clarity, regulatory depth, and institutional expertise to support the platform’s mission of enabling smart and secure fixed income investing for Indian investors.",
            ]}
          />
          <ExpertProfile
            name="Sandeep Dhingra"
            role="Director"
            imageSrc="/avatars/sandeep.png"
            bio={[
              "Sandeep Dhingra is a fintech entrepreneur and fixed income data expert with over 25 years of experience across global credit markets. He brings deep specialization in bond pricing, index construction, and market data architecture, having pioneered open-source pricing models and structured bond analytics used by ETFs and institutional platforms.",
              "His career spans both traditional finance and product innovation—combining roles in trading desks, investment banks, and financial data firms. As the long-standing CEO of FactEntry, he has led the development of cutting-edge credit datasets and bond intelligence platforms trusted by global market participants.",
              "At MeraDhan, Sandeep applies his extensive knowledge of data modeling, market infrastructure, and cross-asset content strategy to build India's most robust and transparent fixed income investment ecosystem.",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

export default OurExports;
type ExpertProfileProps = {
  name: string;
  role: string;
  imageSrc: string;
  imageAlt?: string;
  bio: string[];
};

export function ExpertProfile({
  name,
  role,
  imageSrc,
  imageAlt,
  bio,
}: ExpertProfileProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex items-center gap-4">
        <div className="border-2 border-primary border-dotted rounded-full p-0.5 flex justify-center items-center w-18 h-18">
          <img
            src={imageSrc}
            alt={imageAlt || name}
            width={100}
            height={100}
            className="w-full h-full rounded-full object-cover aspect-square"
          />
        </div>

        <div className="flex flex-col">
          <h4 className="font-semibold text-xl">{name}</h4>
          <p className="text-sm md:text-base">{role}</p>
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-3">
        {bio.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
