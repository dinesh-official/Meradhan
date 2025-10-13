"use client";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import Table from "../../../Table";
import AuthenticationLogsCardHeaderFilters from "./_components/AuthenticationLogsCardHeaderFilters";
function AuthenticationActivityLogsView() {
  return (
   
      <Card>
       <AuthenticationLogsCardHeaderFilters/>
        <CardContent>
          <Table />
        </CardContent>
        <CardPagination onClick={() => {}} page={1} totalPages={6} />
      </Card>

  );
}

export default AuthenticationActivityLogsView;
