import React from "react";
import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import OrdersPage from "./OrdersPage";
import { getAccountPagesMetaData } from "@/graphql/getAccountPagesMetaData";

export const revalidate = 0;
export const generateMetadata = async () => {
  return await getAccountPagesMetaData("dashboard/orders");
};

function page() {
  return (
    <AccountViewPort>
      <OrdersPage />
    </AccountViewPort>
  );
}

export default page;
