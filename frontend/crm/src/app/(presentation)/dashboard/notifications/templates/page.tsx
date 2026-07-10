import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import NotificationTemplatesView from "./NotificationTemplatesView";

export const metadata = { title: "Notification Templates" };

export default function NotificationTemplatesPage() {
  return (
    <Workspace>
      <NotificationTemplatesView />
    </Workspace>
  );
}
