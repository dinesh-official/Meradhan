import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CreateNSCParticipant from "./CreateNSCParticipant";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

function NewParticipant() {
  return (
    <Workspace actionKey="rfqs.manage">
      
        <PageInfoBar
          title="Add NSE Participant"
          description="Register a new unregistered participant for NSE trading"
          showBack
        />
        <CreateNSCParticipant />
      </Workspace>
  );
}

export default NewParticipant;
