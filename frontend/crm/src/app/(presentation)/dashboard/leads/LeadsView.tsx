"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import LeadsSearchFilterBar from "./_components/LeadsSearchFilterBar";
import Table from "../Table";
import CardPagination from "@/global/elements/table/CardPagination";
import LeadFollowUpNotes from "./_components/followUpNotes/LeadFollowUpNotes";
import { useFollowUpNoteFormHook } from "./_components/followUpNotes/useFollowUpFormDataHook";

function LeadsView() {
  const manager = useFollowUpNoteFormHook();
  return (
    <div>
      <PageInfoBar
        title="Leads Management"
        description="Track and manage potential customers"
        actions={
          <Link href={`/dashboard/leads/create`}>
            <Button>
              <Plus /> Add New Lead
            </Button>
          </Link>
        }
      />
      <LeadFollowUpNotes manager={manager} />
      <Card className="mt-5">
        <LeadsSearchFilterBar placeholder="Search leads..." />
        <CardContent>
          <Table />
        </CardContent>
        <CardPagination onClick={() => {}} page={3} totalPages={10} />
      </Card>
    </div>
  );
}

export default LeadsView;
