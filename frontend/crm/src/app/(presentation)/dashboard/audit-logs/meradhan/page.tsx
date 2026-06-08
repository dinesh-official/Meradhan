import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import MeradhanActivityLogsView from "./activity/MeradhanActivityLogsView";
import MeradhanAuthenticationLogsView from "./authentication/MeradhanAuthenticationLogsView";

function page() {
  return (
    <Workspace actionKey="audit_logs.web.view">
    
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
          <TabsTrigger value="session">Session Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <MeradhanActivityLogsView />
        </TabsContent>
        <TabsContent value="session">
          <MeradhanAuthenticationLogsView />
        </TabsContent>
      </Tabs>
    </Workspace>
  );
}

export default page;
