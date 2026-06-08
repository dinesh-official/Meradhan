import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import NseNotificationsView from "./NseNotificationsView";

export default function NseWebhookNotificationsPage() {
  return (
    <AllowOnlyView permissions={["view:rfq"]}>
      <Workspace>
        <NseNotificationsView />
      </Workspace>
    </AllowOnlyView>
  );
}
