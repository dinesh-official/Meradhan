import Link from "next/link";
import { Download } from "lucide-react";

const languages = [
  { label: "Assamese", href: "/docs/Assamese.zip" },
  { label: "Bengali", href: "/docs/Bengali.zip" },
  { label: "Gujrati", href: "/docs/Gujrati.zip" },
  { label: "Hindi", href: "/docs/Hindi.zip" },
  { label: "Kanada", href: "/docs/Kanada.zip" },
  { label: "Kashmiri", href: "/docs/Kashmiri.zip" },
  { label: "Konkani", href: "/docs/Konkani.zip" },
  { label: "Malyalam", href: "/docs/Malyalam.zip" },
  { label: "Marathi", href: "/docs/Marathi.zip" },
  { label: "Oriya", href: "/docs/Oriya.zip" },
  { label: "Punjabi", href: "/docs/Punjabi.zip" },
  { label: "Sindhi", href: "/docs/Sindhi.zip" },
  { label: "Tamil", href: "/docs/Tamil.zip" },
  { label: "Telegu", href: "/docs/Telegu.zip" },
  { label: "Urdu", href: "/docs/Urdu.zip" },
];

const ClientRegistrationDocumentsContent = () => {
  return (
    <section className="flex w-full justify-center bg-white py-8 md:py-12">
      <div className="container px-5 py-12 md:py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-gray-900">
              Client Registration Documents
            </h1>
            <p className="max-w-4xl text-[15px] leading-relaxed text-gray-700">
              Download Client Registration Documents (Rights &amp;
              Obligations, Risk Disclosure Document, Do&apos;s &amp; Don&apos;ts) in
              vernacular language:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {languages.map((language) => (
              <Link
                key={language.label}
                href={language.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 transition hover:border-[#F25C4C] hover:text-[#F25C4C]"
              >
                <span>{language.label}</span>
                <Download className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
            <span className="font-medium">Note:</span> This document is a
            translated version of the client registration documents in English
            and is being provided in vernacular language to facilitate better
            understanding by the investors. In case of any ambiguity, the
            contents of the English version would prevail.
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientRegistrationDocumentsContent;
