import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import PortfolioPageClient from "./PortfolioPageClient";

export default async function PortfolioPage() {
  return (
    <AccountViewPort>
      <PortfolioPageClient />
    </AccountViewPort>
  );
}