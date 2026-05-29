import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import NseNotificationsView from "./NseNotificationsView";

export default function NseWebhookNotificationsPage() {
  return (
    <Workspace actionKey="rfqs.view">
      
        <NseNotificationsView />
      </Workspace>
  );
}
