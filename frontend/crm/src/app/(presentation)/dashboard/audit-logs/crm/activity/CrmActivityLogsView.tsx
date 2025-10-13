"use client";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import Table from "../../../Table";
import ActivityLogsCardHeaderFilters from "./_components/ActivityLogsCardHeaderFilters";
function CrmActivityLogsView() {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Audit Logs"
        description="Track all system activities and user sessions"
        showBack
      />
      <Card>
       <ActivityLogsCardHeaderFilters/>
        <CardContent>
          <Table />
        </CardContent>
        <CardPagination onClick={() => {}} page={1} totalPages={6} />
      </Card>
    </div>
  );
}

export default CrmActivityLogsView;
