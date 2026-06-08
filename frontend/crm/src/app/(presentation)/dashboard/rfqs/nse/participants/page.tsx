import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import ParticipantsView from "./ParticipantsView";

function page() {
  return (
    <Workspace>
      <PageInfoBar
        title="Rfq Participants"
        description="manage rfq participants"
      />
      <ParticipantsView />
    </Workspace>
  );
}

export default page;
