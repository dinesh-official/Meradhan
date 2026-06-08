import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import OrderDetailsView from "./OrderDetailsView";

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Next.js page signature requires params
async function page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Workspace>
      <OrderDetailsView />
    </Workspace>
  );
}

export default page;

