import { cn } from '@/lib/utils'
import React from 'react'

const offerings = [
  {
    title: "Learn & Stay Informed",
    points: [
      "Market Insights & Research Reports",
      "Expert Blogs & Educational Resources on fixed income investing",
      "Latest News & Updates on the bond market",
    ],
  },
  {
    title: "Invest & Trade",
    points: [
      "Buy & Sell Bonds effortlessly through a secure platform",
      "Access to Government & Corporate Bonds",
      "Competitive Pricing & Real-Time Market Data",
    ],
  },
];

const advisory = {
  title: "Personalized Advisory & Tools",
  points: [
    "Investment Planning Assistance",
    "Bond Portfolio Building Strategies",
    "Risk & Return Analysis Tools",
    "MeraDhan-GPT – AI-powered assistance for fixed income queries",
    "Return Calculator – Evaluate potential returns on fixed income investments",
    "Fixed Deposit Calculator – Compare and analyze FD returns for informed decisions",
  ],
};

const OfferingsSection = () => {
  return (
     <section className="mt-16 bg-[#ebf6ff]">
        <div className="container ">
          <div className='px-4 py-12 md:py-16"'>
          {/* Heading */}
          <h2
            className={cn(
              "text-3xl md:text-4xl font-medium text-slate-900",
              "quicksand-medium"
            )}
          >
            Our <span className="text-[#F25C4C] font-semibold">Offerings</span>
          </h2>

          {/* Top row: two cards */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {offerings.map((blk, i) => (
              <div key={i} className="rounded-2xl bg-white p-6 md:p-8">
                <h3
                  className={cn(
                    "text-xl md:text-2xl font-semibold text-slate-800",
                    "quicksand-medium"
                  )}
                >
                  {blk.title}
                </h3>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-700">
                  {blk.points.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom full-width card */}
          <div className="mt-6">
            <div className="rounded-2xl bg-white p-6 md:p-8">
              <h3
                className={cn(
                  "text-xl md:text-2xl font-semibold text-slate-800",
                  "quicksand-medium"
                )}
              >
                {advisory.title}
              </h3>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-700">
                {advisory.points.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          </div>
        </div>
      </section>
  )
}

export default OfferingsSection