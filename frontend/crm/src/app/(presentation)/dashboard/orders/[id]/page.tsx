import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import OrderDetailsView from "./OrderDetailsView";

async function page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Workspace>
      <OrderDetailsView />
    </Workspace>
  );
}

export default page;

