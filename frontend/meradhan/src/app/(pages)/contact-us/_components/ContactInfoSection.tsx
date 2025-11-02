import { CONTACT_INFO } from "@/constants/contact";
import { ContactCard } from "./ContactCard";

export function ContactInfoSection({}) {
  return (
    <div className="mt-5 container">
      <div className="flex flex-wrap gap-5 py-10">
        <ContactCard
          icon={CONTACT_INFO.phone.icon}
          label={CONTACT_INFO.phone.label}
          value={CONTACT_INFO.phone.value}
          href={CONTACT_INFO.phone.href}
          iconSize={20}
        />
        <ContactCard
          icon={CONTACT_INFO.email.icon}
          label={CONTACT_INFO.email.label}
          value={CONTACT_INFO.email.value}
          href={CONTACT_INFO.email.href}
          iconSize={20}
        />
      </div>
    </div>
  );
}
