import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import ImpersonateUserView from "./ImpersonateUserView";

export const revalidate = 0;

export default function ImpersonateUserPage() {
  return (
    <Workspace actionKey="system.impersonate">
      
        <ImpersonateUserView />
      </Workspace>
  );
}
