"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { FaInstagramSquare } from "react-icons/fa";
import {
  FaFacebook,
  FaFilePdf,
  FaLinkedin,
  FaLocationDot,
  FaPinterest,
  FaXTwitter,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

export default function Footer({ lightModded }: { lightModded?: boolean }) {
  return (
    <footer role="contentinfo">
      <div className={cn("bg-[#f5f5f5] py-12", lightModded && "bg-white")}>
        <div className={!lightModded ? "container" : "px-8"}>
          <p
            className={cn(
              "lg:px-28 text-sm text-center",
              lightModded && "lg:px-0"
            )}
          >
            Disclaimer : Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully
            <br />
            MeraDhan is a platform providing access to fixed income products and related information. We do not provide investment advisory services. Users are requested to make investment decisions based on their own assessment or consult their financial advisor.
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
                  <a
                    href="https://www.facebook.com/MeraDhanCo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="Facebook Page of MeraDhan"
                    title="Facebook Page of MeraDhan"
                  >
                    <FaFacebook aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/meradhan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="Instagram Profile of MeraDhan"
                    title="Instagram Profile of MeraDhan"
                  >
                    <FaInstagramSquare aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://in.pinterest.com/meradhanco/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="Pinterest Profile of MeraDhan"
                    title="Pinterest Profile of MeraDhan"
                  >
                    <FaPinterest aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/company/meradhan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="LinkedIn Profile of MeraDhan"
                    title="LinkedIn Profile of MeraDhan"
                  >
                    <FaLinkedin aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/MeraDhanCo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F25C4C] transition-colors duration-200"
                    aria-label="Twitter Profile of MeraDhan"
                    title="Twitter Profile of MeraDhan"
                  >
                    <FaXTwitter aria-hidden="true" />
                  </a>
                </li>
              </ul>
              <div className="flex flex-col gap-2 text-xs">
                <p><strong>BondNest Capital India Securities Private Limited</strong></p>
                <p><strong>SEBI Registration No.:</strong> INZ000330234</p>
                <p><strong>NSE Member ID:</strong> 90480 (Debt Segment)</p>
                <p><strong>BSE Member ID:</strong> 6963 (Debt Segment)</p>
                <p><strong>CIN:</strong> U66190MH2025PTC441753</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 text-sm">
                  <div className="mt-1 w-4">
                    <FaLocationDot size={16} aria-hidden="true" />
                  </div>
                  <p>
                    D 2703, Ashok Tower, Dr SSR Road, Parel (East) <br /> Mumbai -
                    400012, Maharashtra
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm flx">
                  <div className="w-4">
                    <MdEmail size={16} aria-hidden="true" />
                  </div>
                  <a
                    href="mailto:contact@meradhan.co"
                    title="Contact Email of MeraDhan"
                    aria-label="Contact Email of MeraDhan"
                  >
                    contact@meradhan.co
                  </a>
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
                      title="Bond Directory"
                      aria-label="Bond Directory"
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
                      title="Investor Charter"
                      aria-label="Investor Charter"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Investor Charter
                      <FaFilePdf aria-hidden="true" className="inline ml-1 mb-0.5" size={12} />
                      <span className="sr-only"> (opens PDF in new tab)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/Regulatory-Disclosure.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Regulatory Disclosure"
                      aria-label="Regulatory Disclosure"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Regulatory Disclosure
                      <FaFilePdf aria-hidden="true" className="inline ml-1 mb-0.5" size={12} />
                      <span className="sr-only"> (opens PDF in new tab)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/Investor-Grievance-Redressal-Mechanism.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Investor Grievance"
                      aria-label="Investor Grievance"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Investor Grievance
                      <FaFilePdf aria-hidden="true" className="inline ml-1 mb-0.5" size={12} />
                      <span className="sr-only"> (opens PDF in new tab)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/client-registration-documents"
                      title="Client Registration Documents"
                      aria-label="Client Registration Documents"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Client Registration Documents
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
                      title="About MeraDhan"
                      aria-label="About MeraDhan"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/partners-and-distributors"
                      title="MeraDhan Partners and Distributors"
                      aria-label="MeraDhan Partners and Distributors"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Partners & Distributors
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      title="MeraDhan Disclaimer"
                      aria-label="MeraDhan Disclaimer"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      title="Contact MeraDhan"
                      aria-label="Contact MeraDhan"
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
                      title="Bond Investment Glossary"
                      aria-label="Bond Investment Glossary"
                      className="hover:text-[#F25C4C] transition-colors duration-200"
                    >
                      Glossary
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faqs"
                      title="Frequently Asked Questions"
                      aria-label="Frequently Asked Questions"
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
              title="MeraDhan Privacy Policy"
              aria-label="MeraDhan Privacy Policy"
              className="hover:text-secondary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-use"
              title="MeraDhan Terms of Use"
              aria-label="MeraDhan Terms of Use"
              className="hover:text-secondary transition-colors duration-200"
            >
              Terms of Use
            </Link>
            <Link
              href="/cookie-policy"
              title="MeraDhan Cookie Policy"
              aria-label="MeraDhan Cookie Policy"
              className="hover:text-secondary transition-colors duration-200"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
