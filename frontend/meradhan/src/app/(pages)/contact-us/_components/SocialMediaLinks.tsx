"use client";

import { SOCIAL_MEDIA_LINKS } from "@/constants/contact";
import Link from "next/link";

export function SocialMediaLinks() {
  return (
    <div className="container">
      <div className="flex justify-center items-center gap-5 py-10">
        <p>Social Media:</p>
        <ul className="flex gap-3 text-primary text-xl">
          {SOCIAL_MEDIA_LINKS.map((social) => (
            <li key={social.name}>
              <Link
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon bg-primary rounded-full hover:text-[#F25C4C] transition-colors duration-200"
                aria-label={social.ariaLabel}
              >
                <social.icon />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
