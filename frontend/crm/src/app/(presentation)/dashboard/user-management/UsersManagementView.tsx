"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Briefcase, Heart, Layers, Plus, Users } from "lucide-react";
import UsersSearchFilterBar from "./_components/UsersSearchFilterBar";
import CreateNewUserPopup from "./_components/newUser/CreateNewUserPopup";
import UsersTable, { UserRow } from "./_components/Table";

const usersMock: UserRow[] = [
  {
    id: "U-1001",
    name: "Rohit Verma",
    email: "rohit.verma@example.com",
    phoneNo: "9876543210",
    avatar: "https://i.pravatar.cc/80?img=12",
    lastLogin: "2025-10-10T12:30:00Z",
    role: "manager",
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2025-10-12T09:40:00Z",
    createdBy: "admin@acme.com",
  },
  {
    id: "U-1002",
    name: "Neha Sharma",
    email: "neha.sharma@example.com",
    phoneNo: "9810012345",
    avatar: "https://i.pravatar.cc/80?img=21",
    lastLogin: "2025-10-13T08:05:00Z",
    role: "admin",
    createdAt: "2025-05-15T10:00:00Z",
    updatedAt: "2025-10-13T08:06:00Z",
    createdBy: "admin@acme.com",
  },
  {
    id: "U-1003",
    name: "Amit Patel",
    email: "amit.patel@example.com",
    phoneNo: "9911223344",
    avatar: "https://i.pravatar.cc/80?img=31",
    lastLogin: "2025-10-01T17:20:00Z",
    role: "viewer",
    createdAt: "2025-07-22T10:00:00Z",
    updatedAt: "2025-09-30T18:00:00Z",
    createdBy: "neha.sharma@example.com",
  },
];
function UsersManagementView() {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="User Management"
        description="Manage system users and their permissions"
        actions={
          <CreateNewUserPopup>
            <Button>
              <Plus /> Add New User
            </Button>
          </CreateNewUserPopup>
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
          <UsersTable data={usersMock}/>
        </CardContent>
        <CardPagination onClick={() => {}} page={5} totalPages={8} />
      </Card>
    </div>
  );
}

export default UsersManagementView;
