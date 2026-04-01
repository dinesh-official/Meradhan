import { getAccountPagesMetaData } from "@/graphql/getAccountPagesMetaData";
import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import PortfolioPageClient from "./PortfolioPageClient";

export const revalidate = 0;
export const generateMetadata = async () => {
  return await getAccountPagesMetaData("dashboard/portfolio");
};

export default async function PortfolioPage() {
  return (
    <AccountViewPort>
      <PortfolioPageClient />
    </AccountViewPort>
  );
}