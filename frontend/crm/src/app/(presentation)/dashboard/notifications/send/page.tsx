import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import SendNotificationView from "./SendNotificationView";

function Page() {
  return (
    <Workspace actionKey="notifications.send">
      
        <SendNotificationView />
      </Workspace>
  );
}

export default Page;
