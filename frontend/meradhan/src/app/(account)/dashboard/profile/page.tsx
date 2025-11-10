import apiGateway from "@root/apiGateway";
import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import ProfilePage from "./ProfilePage";
import apiServerCaller from "@/core/connection/apiServerCaller";
import { cookies } from "next/headers";
import { getAccountPagesMetaData } from "@/graphql/getAccountPagesMetaData";

export const revalidate = 0;

export const generateMetadata = async () => {
  return  await getAccountPagesMetaData("dashboard/profile");
}

async function page() {
  const cookie = await cookies();
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiServerCaller
  );

  // Fetch customer data
  const id = cookie.get("userId")?.value || "";
  const userData = await customerApi.customerInfoById(Number(id));

  return (
    <AccountViewPort
      title={
        <>
          My <span className="font-bold">Profile</span>
        </>
      }
    >
      <ProfilePage profileData={userData.data.responseData} />
    </AccountViewPort>
  );
}

export default page;
