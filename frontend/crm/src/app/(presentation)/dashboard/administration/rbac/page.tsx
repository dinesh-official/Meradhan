import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import RbacAdminView from "./RbacAdminView";

export const revalidate = 0;

export default function RbacAdminPage() {
  return (
    <Workspace actionKey="system.rbac.manage">
      
        <RbacAdminView />
      </Workspace>
  );
}
