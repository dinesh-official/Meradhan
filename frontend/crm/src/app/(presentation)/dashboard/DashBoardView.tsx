import DbTopActionCards from "@/app/(presentation)/dashboard/_components/DBTopActionCards";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import { LeadSourcesPiChart } from "./_components/chart/LeadSourcesPiChart";
import { SalesPerformanceChart } from "./_components/chart/SalesPerformanceChart";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import { LoginLogsHistory } from "./audit-logs/crm/logs/_login_logs/LoginLogsHistory";

const DashBoardView = () => {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with your bond platform today."
        actions={<DbTopActionCards />}
      />

      <div className="gap-5 grid md:grid-cols-2 xl:grid-cols-4">
        <StatusCountCard
          title="Active Leads"
          value="10K+"
          changeText="+12.5% from last month"
          arrowType="up"
          variant="pinkGradient"
        />

        <StatusCountCard
          title="Completed Projects"
          value="234"
          changeText="+8% this quarter"
          arrowType="down"
          variant="greenGradient"
        />

        <StatusCountCard
          title="User Drop Rate"
          value="5%"
          changeText="-2% from last month"
          arrowType="down"
          variant="redGradient"
        />

        <StatusCountCard
          title="User Gain Rate"
          value="1%"
          changeText="-2% from last month"
          arrowType="down"
          variant="grayGradient"
        />
      </div>
      <div className="gap-5 grid lg:grid-cols-7">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end items-end h-full">
            <SalesPerformanceChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <LeadSourcesPiChart />
          </CardContent>
        </Card>
      </div>
      <AllowOnlyView permissions={["view:crmauditlogs"]}>
        <LoginLogsHistory />
      </AllowOnlyView>
    </div>
  );
};

export default DashBoardView;
