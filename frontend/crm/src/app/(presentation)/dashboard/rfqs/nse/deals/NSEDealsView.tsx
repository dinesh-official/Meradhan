"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import CardPagination from "@/global/elements/table/CardPagination";
import { Search } from "lucide-react";
import Table from "../../../Table";
import Demo from "./_components/Demo";
function NSEDealsView() {
  return (
    <div className="flex flex-col gap-5 mt-5">
      <div className="grid 2xl:grid-cols-4 xl:grid-cols-3  gap-5">
        <StatusCountCard
          title="Deal Submit (Proposer)"
          value={10}
          changeText=""
          variant="purpleGradient"
        />
        <StatusCountCard
          title="Deal Submit (Counterparty)"
          value={10}
          changeText=""
          variant="orangeGradient"
        />
        <StatusCountCard
          title="Deal (Confirmed)"
          value={10}
          changeText=""
          variant="greenGradient"
        />
      </div>
      <Demo />
      <Card>
        <CardHeader>
          <CardTitle>Deals Management</CardTitle>
          <CardDescription>
            View and manage deals across different stages
          </CardDescription>
          <div className="mt-2 flex justify-between items-center gap-5">
            <Tabs defaultValue="account">
              <TabsList>
                <TabsTrigger value="account">Deal Proposer</TabsTrigger>
                <TabsTrigger value="password">Deal Counterparty</TabsTrigger>
                <TabsTrigger value="psdassword">Deal Confirmed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Input className="peer ps-9" placeholder="Search..." />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} aria-hidden="true" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table />
        </CardContent>

        <CardPagination onClick={() => {}} page={3} totalPages={10} />
      </Card>
    </div>
  );
}

export default NSEDealsView;
