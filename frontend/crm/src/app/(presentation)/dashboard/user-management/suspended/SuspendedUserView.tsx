"use client";
import { Card, CardContent } from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import UsersTable from "../_components/listView/CrmUsersTable";
import CardPagination from "@/global/elements/table/CardPagination";
import { useState } from "react";

function SuspendedUserView() {
  const [page, setPage] = useState(1);

  const usersApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);

  const fetchUserQuery = useQuery({
    queryKey: ["searchCRMUsers"],
    queryFn: async () => {
      const response = await usersApi.findUsers({
        status: "SUSPENDED",
        page: page.toString(),
      });
      return response.data;
    },
  });

  const isShowPagination = () => {
    return (
      (fetchUserQuery.data?.responseData.data.length || 0) > 0 &&
      fetchUserQuery.data?.responseData.meta.totalPages != 1 &&
      !fetchUserQuery.isPending
    );
  };

  return (
    <div className="mt-5">
      <Card>
        <CardContent>
          <UsersTable
            data={fetchUserQuery.data?.responseData.data || []}
            isLoading={fetchUserQuery.isLoading}
          />
        </CardContent>
        {isShowPagination() && (
          <CardPagination
            onClick={setPage}
            page={page}
            totalPages={fetchUserQuery.data?.responseData.meta.totalPages || 1}
          />
        )}
      </Card>
    </div>
  );
}

export default SuspendedUserView;
