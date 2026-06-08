"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Briefcase, Heart, Layers, Plus, Users } from "lucide-react";
import UsersTable from "./_components/listView/CrmUsersTable";
import UsersSearchFilterBar from "./_components/listView/UsersSearchFilterBar";
import CreateNewUserPopup from "./_components/mangeuser/CreateNewUserPopup";
import { useUserFilterListHook } from "./_components/listView/useUserFilterListHook";
import { useFilterListApiHook } from "./_components/listView/useUserFilterListApiHook";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";

const crmUsersApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);

function UsersManagementView() {
  const filterManager = useUserFilterListHook();
  const filterApiManager = useFilterListApiHook(filterManager);
  const summaryQuery = useQuery({
    queryKey: ["crm-users-summary"],
    queryFn: async () => {
      const response = await crmUsersApi.getSummary();
      return response.data.responseData;
    },
    staleTime: 60_000,
  });

  const isShowPagination = () => {
    return (
      (filterApiManager.fetchUserQuery.data?.responseData.data.length || 0) >
        0 &&
      filterApiManager.fetchUserQuery.data?.responseData.meta.totalPages != 1 &&
      !filterApiManager.fetchUserQuery.isPending
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="User Management"
        description="Manage system users and their permissions"
        actions={
          <AllowOnlyView permissions={["create:user"]}>
            <CreateNewUserPopup>
              <Button>
                <Plus /> Add New User
              </Button>
            </CreateNewUserPopup>
          </AllowOnlyView>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {/* Total Users */}
        <StatusCountCard
          title="Total Users"
          value={
            summaryQuery.isLoading ? "…" : summaryQuery.data?.totalUsers ?? 0
          }
          changeText="Active directory counts"
          variant="purpleGradient"
          bgIcon={Users}
        />

        {/* Active Users */}
        <StatusCountCard
          title="Active Users"
          value={
            summaryQuery.isLoading ? "…" : summaryQuery.data?.activeUsers ?? 0
          }
          changeText="Account status = ACTIVE"
          variant="greenGradient"
          bgIcon={Heart}
        />

        {/* Admins */}
        <StatusCountCard
          title="Admins"
          value={
            summaryQuery.isLoading ? "…" : summaryQuery.data?.adminUsers ?? 0
          }
          changeText="Role = ADMIN"
          variant="redGradient"
          bgIcon={Briefcase}
        />

        {/* Sales Team */}
        <StatusCountCard
          title="Sales Team"
          value={
            summaryQuery.isLoading ? "…" : summaryQuery.data?.salesUsers ?? 0
          }
          changeText="Role = SALES"
          variant="blueGradient"
          bgIcon={Layers}
        />
      </div>

      <Card>
        <UsersSearchFilterBar
          placeholder="Search Users..."
          onRoleChange={filterManager.state.setRoleFilter}
          onSearchChange={filterManager.state.setSearch}
          onStatusChange={filterManager.state.setAccountStatus}
          roleValue={filterManager.state.roleFilter}
          searchValue={filterManager.state.search}
          statusValue={filterManager.state.accountStatus}
        />
        <CardContent>
          <UsersTable
            data={filterApiManager.fetchUserQuery.data?.responseData.data || []}
            isLoading={filterApiManager.fetchUserQuery.isLoading}
          />
        </CardContent>
        {isShowPagination() && (
          <CardPagination
            onClick={filterManager.state.setPaginationIndex}
            page={filterManager.state.paginationIndex}
            totalPages={
              filterApiManager.fetchUserQuery.data?.responseData.meta
                .totalPages || 1
            }
          />
        )}
      </Card>
    </div>
  );
}

export default UsersManagementView;
