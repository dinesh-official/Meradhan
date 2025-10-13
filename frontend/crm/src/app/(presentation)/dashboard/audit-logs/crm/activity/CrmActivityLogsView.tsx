"use client";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import Table from "../../../Table";
import ActivityLogsCardHeaderFilters from "./_components/ActivityLogsCardHeaderFilters";
function CrmActivityLogsView() {
  return (
    <Card>
      <ActivityLogsCardHeaderFilters />
      <CardContent>
        <Table />
      </CardContent>
      <CardPagination onClick={() => {}} page={1} totalPages={6} />
    </Card>
  );
}

export default CrmActivityLogsView;
