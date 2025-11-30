import React from "react";
import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import OrdersPage from "./OrdersPage";

function page() {
  return (
    <AccountViewPort>
      <OrdersPage />
    </AccountViewPort>
  );
}

export default page;
