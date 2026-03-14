import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { memo } from "react";
import { FaInstagramSquare } from "react-icons/fa";
import {
  FaFacebook,
  FaLinkedin,
  FaLocationDot,
  FaPinterest,
  FaXTwitter,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

function Footer({ lightModded }: { lightModded?: boolean }) {
  return (
    <div>
      <div className={cn("bg-[#f5f5f5] py-12", lightModded && "bg-white")}>
        <div className={!lightModded ? "container" : "px-8"}>
          <p
            className={cn(
              "lg:px-28 text-sm text-center",
              lightModded && "lg:px-0"
            )}
          >
            Disclaimer : Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully
          </p>

          <div
            className={cn(
              "grid lg:grid-cols-2 mt-14",
              lightModded && "border-t border-gray-200 pt-7"
            )}
          >
            <div className="flex flex-col gap-6">
              <h5 className="text-xl">MeraDhan</h5>

              <ul className="flex gap-4 text-primary text-xl">
                <li>
                  <Link
                    href="https://www.facebook.com/MeraDhanCo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="Facebook"
                  >
                    <FaFacebook />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.instagram.com/meradhan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <FaInstagramSquare />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://in.pinterest.com/meradhanco/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="Pinterest"
                  >
                    <FaPinterest />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/company/meradhan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://x.com/MeraDhanCo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="Twitter (X)"
                  >
                    <FaXTwitter />
                  </Link>
                </li>
              </ul>
              <div className="flex flex-col gap-2 text-xs">
                <p><b>BondNest Capital India Securities Private Limited</b></p>
                <p><b>SEBI Registration No.:</b> INZ00033023</p>
                <p><b>NSE Member ID:</b> 90480 (Debt Segment)</p>
                <p><b>BSE Member ID:</b> 6963 (Debt Segment)</p>
                <p><b>CIN:</b> U66190MH2025PTC441753</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 text-sm">
                  <div className="mt-1 w-4">
                    <FaLocationDot size={16} />
                  </div>
                  <p>
                    D 2703, Ashok Tower, Dr SSR Road, Parel (East) <br /> Mumbai -
                    400012, Maharashtra
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm flx">
                  <div className="w-4">
                    <MdEmail size={16} />
                  </div>
                  <p>contact@meradhan.co</p>
                </div>
              </div>
            </div>

            <div className="gap-5 grid lg:grid-cols-3 mt-5">
              <div>
                <h6 className="font-base text-lg">Explore</h6>
                <ul className="flex flex-col gap-3 mt-3 text-sm">
                  <li>
                    <Link
                      href="/bonds"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Bond Directory
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/Investor-Charter.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Investor Charter
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/Regulatory-Disclosure.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Regulatory Disclosure
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/Investor-Grievance-Redressal-Mechanism.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Investor Grievance
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h6 className="font-base text-lg">Company</h6>
                <ul className="flex flex-col gap-3 mt-3 text-sm">
                  <li>
                    <Link
                      href="/about-us"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/partners-and-distributors"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Partners & Distributors
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h6 className="font-base text-lg">Resources</h6>
                <ul className="flex flex-col gap-3 mt-3 text-sm">
                  {/* <li>
                    <Link
                      href="/blog"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Blog
                    </Link>
                  </li> */}
                  {/* <li>
                    <Link
                      href="/news"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      News
                    </Link>
                  </li> */}
                  {/* <li>
                    <Link
                      href="/economic-calendar"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Economic Calendar
                    </Link>
                  </li> */}
                  <li>
                    <Link
                      href="/glossary"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Glossary
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faqs"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      FAQs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={!lightModded ? "container" : "border-t px-8 border-gray-200"}
      >
        <div className="flex md:flex-row flex-col justify-center md:justify-between items-center md:items-center gap-2 py-6 text-sm">
          <p>© {new Date().getFullYear()} MeraDhan. All Rights Reserved</p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="hover:text-secondary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-use"
              className="hover:text-secondary transition-colors duration-200"
            >
              Terms of Use
            </Link>
            <Link
              href="/cookie-policy"
              className="hover:text-secondary transition-colors duration-200"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Footer);
