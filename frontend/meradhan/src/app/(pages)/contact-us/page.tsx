import {
  AddressSection,
  ContactInfoSection,
  RegulatoryInfo,
  SectionHeader,
  SocialMediaLinks,
} from "@/app/(pages)/contact-us/_components";
import {
  ADDRESSES,
  CONTACT_INFO,
  REGULATORY_INFO,
  SECTION_CONTENT,
  SOCIAL_MEDIA_LINKS,
} from "@/constants/contact";
import ViewPort from "@/global/components/wrapper/ViewPort";
import ContactForm from "./_components/ContactForm";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";

export const revalidate = 0;

export async function generateMetadata() {
  return await generatePagesMetaData("contact-us");
}

const ContactUsPage = () => {
  return (
    <ViewPort>
      {/* Hero Section */}
      <div className="relative container">
        <SectionHeader
          title={SECTION_CONTENT.hero.title}
          highlightedWord="Us"
          description={SECTION_CONTENT.hero.description}
        />
        <ContactForm />
      </div>
      {/* Help Section */}
      <div className="bg-muted">
        <div className="container">
          <SectionHeader
            title={SECTION_CONTENT.help.title}
            highlightedWord="Help?"
            description={SECTION_CONTENT.help.description}
          />
        </div>
      </div>

      {/* Contact Information */}
      <ContactInfoSection />

      <div className="lg:mt-28">
        {/* Addresses */}
        <AddressSection
          title={ADDRESSES.registered.title}
          address={ADDRESSES.registered.address}
          highlightedWord="Address"
          contact={CONTACT_INFO.grievances}
        />

        <AddressSection
          title={ADDRESSES.communication.title}
          address={ADDRESSES.communication.address}
          highlightedWord="Address"
          contact={CONTACT_INFO.phone2}
        />
      </div>

      {/* Regulatory Information */}
      <RegulatoryInfo items={REGULATORY_INFO} />

      {/* Social Media Links */}
      <SocialMediaLinks socialLinks={SOCIAL_MEDIA_LINKS} />
    </ViewPort>
  );
};

export default ContactUsPage;
