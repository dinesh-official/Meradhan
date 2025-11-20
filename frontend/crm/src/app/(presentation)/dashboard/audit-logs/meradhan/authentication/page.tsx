import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { LoginLogsMeradhan } from "./LoginLogsMeradhan";

function Page() {
  return (
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Meradhan Authentication Activity Logs"
          description="Login history and session termination tracking with browser and device information"
          showBack
        />
        <LoginLogsMeradhan />
      </div>
    </Workspace>
  );
}

export default Page;
