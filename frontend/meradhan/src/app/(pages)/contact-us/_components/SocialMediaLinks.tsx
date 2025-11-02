import Link from "next/link";
import type { SocialMediaItem } from "@/types/contact";

interface SocialMediaLinksProps {
  socialLinks: readonly SocialMediaItem[];
}

export function SocialMediaLinks({ socialLinks }: SocialMediaLinksProps) {
  return (
    <div className="container">
      <div className="flex justify-center items-center gap-5 py-10">
        <p>Social Media:</p>
        <ul className="flex gap-3 text-primary text-xl">
          {socialLinks.map((social) => (
            <li key={social.name}>
              <Link
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary rounded-full hover:text-[#F25C4C] transition-colors duration-200"
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