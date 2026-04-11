import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import NotificationLogsView from "./NotificationLogsView";

export const metadata = { title: "Notification Logs" };

export default function NotificationLogsPage() {
  return (
    <Workspace>
      <NotificationLogsView />
    </Workspace>
  );
}
