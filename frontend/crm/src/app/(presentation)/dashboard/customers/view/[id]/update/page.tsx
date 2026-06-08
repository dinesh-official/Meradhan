import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import UpdateCustomerView from "./UpdateCustomer.View";
import { decodeId } from "@/global/utils/url.utils";

export const revalidate = 0;
async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);
  return (
    <Workspace actionKey="customers.edit">
    
      <PageInfoBar
        title="Update Customer Profile"
        description="Update Customer Latest Information"
        showBack
      />
      <UpdateCustomerView id={id} />
    </Workspace>
  );
}

export default page;
