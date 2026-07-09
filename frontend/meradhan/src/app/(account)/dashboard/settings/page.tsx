import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import { getAccountPagesMetaData } from "@/graphql/getAccountPagesMetaData";
import SettingsPageClient from "./SettingsPageClient";

export const revalidate = 0;

export const generateMetadata = async () => {
  return await getAccountPagesMetaData("dashboard/settings");
};

export default function SettingsPage() {
  return (
    <AccountViewPort
      title={
        <div className="hidden md:flex gap-2">
          Security <span className="font-bold">Settings</span>
        </div>
      }
    >
      <SettingsPageClient />
    </AccountViewPort>
  );
}
