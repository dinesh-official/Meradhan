import ViewPort from "@/global/components/wrapper/ViewPort";
import type { Metadata } from "next";
import ClientRegistrationDocumentsContent from "./_components/ClientRegistrationDocumentsContent";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Client Registration Documents | MeraDhan",
  description:
    "Download client registration documents in vernacular languages for better investor understanding.",
};

export default function ClientRegistrationDocumentsPage() {
  return (
    <ViewPort>
      <ClientRegistrationDocumentsContent />
    </ViewPort>
  );
}
