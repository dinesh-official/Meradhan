import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import ServiceRequestsView from "./ServiceRequestsView";

export default function page() {
  return (
    <AllowOnlyView permissions={["view:service_requests"]}>
      <Workspace>
        <ServiceRequestsView />
      </Workspace>
    </AllowOnlyView>
  );
}
