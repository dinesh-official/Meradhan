import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import { CustomersTrash } from "./_sections/CustomersTrash";

function page() {
  return (
    <Workspace actionKey="bin.view">
      
        <PageInfoBar
          title="Manage Recycle Bin"
          description="items restore or permanently remove them as needed."
        />
        <CustomersTrash />
      </Workspace>
  );
}

export default page;
