import { quicksand } from '@/global/font/font'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'

const MissionVisionSection = () => {
  return (
       <section className="mt-16 bg-[#ebf6ff]">
            <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
              <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
                <div className="w-full md:w-2/5 flex justify-center md:justify-start">
                  <Image
                    src="/assets/target_meradhan.png"
                    alt="Mission target"
                    width={260}
                    height={260}
                    className="h-auto w-[220px] md:w-[260px]"
                    priority
                  />
                </div>
    
                <div className="w-full md:w-3/5">
                  <h2
                    className={cn(
                      "text-3xl md:text-4xl font-medium text-slate-900",
                      quicksand.className
                    )}
                  >
                    Our{" "}
                    <span className="text-[#F25C4C] font-semibold">Mission</span>
                  </h2>
                  <p className="mt-4 leading-relaxed text-slate-700">
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
    
              <div className="flex flex-col items-center gap-8 md:flex-row-reverse md:gap-12">
                <div className="w-full md:w-2/5 flex justify-center md:justify-end">
                  <Image
                    src="/assets/ideaLamp-meradhan.png" // swap to your bulb art path
                    alt="Vision bulb"
                    width={260}
                    height={260}
                    className="h-auto w-[220px] md:w-[260px]"
                  />
                </div>
    
                <div className="w-full md:w-3/5">
                  <h2
                    className={cn(
                      "text-3xl md:text-4xl font-medium text-slate-900",
                      quicksand.className
                    )}
                  >
                    Our <span className="text-[#F25C4C] font-semibold">Vision</span>
                  </h2>
                  <p className="mt-4 leading-relaxed text-slate-700">
                    We envision a financially empowered India where fixed income
                    investments are a core component of every investor’s portfolio.
                    MeraDhan aims to be the most trusted and user-friendly fixed
                    income investment platform, fostering financial literacy,
                    transparency, and accessibility in the Indian bond market.
                  </p>
                </div>
              </div>
            </div>
          </section>
  )
}

export default MissionVisionSection