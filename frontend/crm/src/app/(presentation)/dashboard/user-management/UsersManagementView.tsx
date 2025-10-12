"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Briefcase, Heart, Layers, Plus, Users } from "lucide-react";
import Table from "../Table";
import UsersSearchFilterBar from "./_components/UsersSearchFilterBar";

function UsersManagementView() {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="User Management"
        description="Manage system users and their permissions"
        actions={
          <Button>
            <Plus /> Add New User
          </Button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {/* Total Users */}
        <StatusCountCard
          title="Total Users"
          value={5}
          changeText=""
          variant="purpleGradient"
          bgIcon={Users}
        />

        {/* Active Users */}
        <StatusCountCard
          title="Active Users"
          value={4}
          changeText=""
          variant="greenGradient"
          bgIcon={Heart}
        />

        {/* Admins */}
        <StatusCountCard
          title="Admins"
          value={5}
          changeText=""
          variant="redGradient"
          bgIcon={Briefcase}
        />

        {/* Sales Team */}
        <StatusCountCard
          title="Sales Team"
          value={0}
          changeText=""
          variant="blueGradient"
          bgIcon={Layers}
        />
      </div>

      <Card>
        <UsersSearchFilterBar placeholder="Search Users..." />
        <CardContent>
          <Table />
        </CardContent>
        <CardPagination onClick={() => {}} page={5} totalPages={8} />
      </Card>
    </div>
  );
}

export default UsersManagementView;
