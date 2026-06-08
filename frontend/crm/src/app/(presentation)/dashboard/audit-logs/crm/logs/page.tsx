import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import CrmActivityLogsVIew from "./_activity_history/CrmActivityLogsVIew";
import { LoginLogsHistory } from "./_login_logs/LoginLogsHistory";
function page() {
  return (
    <AllowOnlyView permissions={["view:crmauditlogs"]}>
    <Workspace>
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
    </AllowOnlyView>
  );
}

export default page;
