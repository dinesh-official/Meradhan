import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import { CustomersTrash } from "./_sections/CustomersTrash";

function page() {
  return (
    <AllowOnlyView permissions={["view:bin"]}>
      <Workspace>
        <PageInfoBar
          title="Manage Recycle Bin"
          description="items restore or permanently remove them as needed."
        />
        <CustomersTrash />
      </Workspace>
    </AllowOnlyView>
  );
}

export default page;
