import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import CreateNSCParticipant from "./CreateNSCParticipant";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

function NewParticipant() {
  return (
    <AllowOnlyView permissions={["create:rfq"]}>
      <Workspace>
        <PageInfoBar
          title="Add NSE Participant"
          description="Register a new unregistered participant for NSE trading"
          showBack
        />
        <CreateNSCParticipant />
      </Workspace>
    </AllowOnlyView>
  );
}

export default NewParticipant;
