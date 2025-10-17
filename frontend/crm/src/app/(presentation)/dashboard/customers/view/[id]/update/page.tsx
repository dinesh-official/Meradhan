import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import UpdateCustomerView from "./UpdateCustomer.View";

export const revalidate = 0;
async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Workspace>
      <PageInfoBar
        title="Update Customer Profile"
        description="Update Customer Latest Information"
        showBack
      />
      <UpdateCustomerView id={Number(id)} />
    </Workspace>
  );
}

export default page;
