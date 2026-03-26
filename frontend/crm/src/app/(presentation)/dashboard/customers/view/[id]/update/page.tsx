import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import UpdateCustomerView from "./UpdateCustomer.View";
import { decodeId } from "@/global/utils/url.utils";

export const revalidate = 0;
async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);
  return (
    <AllowOnlyView permissions={["edit:customer"]}>
    <Workspace>
      <PageInfoBar
        title="Update Customer Profile"
        description="Update Customer Latest Information"
        showBack
      />
      <UpdateCustomerView id={id} />
    </Workspace>
    </AllowOnlyView>
  );
}

export default page;
