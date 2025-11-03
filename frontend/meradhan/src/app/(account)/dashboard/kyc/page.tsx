import { getAccountPagesMetaData } from "@/graphql/getAccountPagesMetaData";
import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import KycWorkSpace from "./_steps/wrapper/KycWorkSpace";
import KycDataProvider from "./_context/KycDataProvider";
import KycFlowStepsView from "./KycFlowStepsView";

export const revalidate = 0;
export const generateMetadata = async () => {
  return  await getAccountPagesMetaData("dashboard/kyc");
}

function KycPage() {
  return (
    <KycDataProvider>
      <AccountViewPort showSideBar={false}>
        <KycWorkSpace>
          <KycFlowStepsView />
        </KycWorkSpace>
      </AccountViewPort>
    </KycDataProvider>
  );
}

export default KycPage;
