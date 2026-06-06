import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import NotificationListsView from "./NotificationListsView";

export const metadata = { title: "Notification Lists" };

export default function NotificationListsPage() {
  return (
    <Workspace actionKey="notifications.lists.view">
      
        <NotificationListsView />
      </Workspace>
  );
}
