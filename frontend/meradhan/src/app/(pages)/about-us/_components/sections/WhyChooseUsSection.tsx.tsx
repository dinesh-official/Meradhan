import { quicksand } from '@/global/font/font'
import { cn } from '@/lib/utils'
import { CheckCircle, Globe, Mail, Phone } from 'lucide-react'
import React from 'react'

const whyChooseUs = [
  "One-Stop Platform – Learn, invest, and manage bonds effortlessly",
  "Trusted & Regulated – Backed by Bond Nest Capital India Securities Pvt Ltd",
  "Transparent & Low-Cost Transactions – No hidden charges, competitive pricing",
  "Expert Insights & Education – Market trends, research, and blogs",
  "Secure & User-Friendly Interface – A seamless investment experience",
  "Advanced Tools & Calculators – DhanGPT, Return Calculator, FD Calculator & more",
];
const WhyChooseUsSection = () => {
  return (
   <>
    <section className="max-w-[70%] mt-[4rem] m-auto px-5 text-gray-800 leading-relaxed space-y-8">
           {/* Heading */}
           <h4
             className={cn(
               "text-3xl md:text-4xl font-medium text-black",
               quicksand.className
             )}
           >
             Why <span className="text-[#F25C4C] font-semibold">Choose Us?</span>
           </h4>
   
           {/* List */}
           <ul className="space-y-5">
             {whyChooseUs.map((item, idx) => (
               <li key={idx} className="flex items-start gap-3">
                 <CheckCircle
                   size={20}
                   className="text-[#6496C8] flex-shrink-0 mt-0.5"
                   strokeWidth={2}
                   fill="#ebf6ff"
                 />
                 <p className="text-[16px] md:text-[17px] text-slate-800">
                   {item}
                 </p>
               </li>
             ))}
           </ul>
         </section>
         <section className="mt-16 bg-[#ebf6ff]">
           <div className="mx-auto max-w-[70%] px-4 py-12 md:py-16 flex flex-col gap-6">
             <h5
               className={cn(
                 "text-2xl md:text-3xl font-medium text-black",
                 quicksand.className
               )}
             >
               Join the Fixed Income Revolution with{" "}
               <span className="text-[#F25C4C] font-semibold">MeraDhan!</span>
             </h5>
   
             <p className="text-gray-700 leading-relaxed">
               Empower your financial future with the stability and security of
               fixed income investments. Explore MeraDhan today and take your first
               step towards smart, sustainable investing.
             </p>
   
             {/* Contact Section */}
             <div className="mt-4 flex flex-col gap-3 text-gray-800">
               <div className="flex items-center gap-3">
                 <Globe size={18} className="text-gray-700" />
                 <a
                   href="https://www.meradhan.co"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="hover:underline"
                 >
                   www.MeraDhan.co
                 </a>
               </div>
   
               <div className="flex items-center gap-3">
                 <Mail size={18} className="text-gray-700" />
                 <a href="mailto:support@meradhan.co" className="hover:underline">
                   support@meradhan.co
                 </a>
               </div>
   
               <div className="flex items-center gap-3">
                 <Phone size={18} className="text-gray-700" />
                 <a href="tel:+919873373195" className="hover:underline">
                   +91 9873373195
                 </a>
               </div>
             </div>
           </div>
         </section>
         </>
  )
}

export default WhyChooseUsSection