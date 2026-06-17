import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import RfqParticipantsAllView from "./RfqParticipantsAllView";

function page() {
  return (
    <AllowOnlyView permissions={["view:rfq"]}>
      <Workspace>
        <PageInfoBar
          title="NSE RFQ Participants"
          description="All NSE RFQ participants pulled live from the NSE /participants/all endpoint."
        />
        <RfqParticipantsAllView />
      </Workspace>
    </AllowOnlyView>
  );
}

export default page;
