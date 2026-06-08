import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import CrmActivityLogsVIew from "./_activity_history/CrmActivityLogsVIew";
import { LoginLogsHistory } from "./_login_logs/LoginLogsHistory";
function page() {
  return (
    <Workspace actionKey="audit_logs.crm.view">
    
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
          <TabsTrigger value="session">Session Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <CrmActivityLogsVIew />
        </TabsContent>
        <TabsContent value="session">
          <LoginLogsHistory />
        </TabsContent>
      </Tabs>
    </Workspace>
  );
}

export default page;
