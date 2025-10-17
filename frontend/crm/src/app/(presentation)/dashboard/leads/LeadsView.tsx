"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import LeadsSearchFilterBar from "./_components/listLeads/LeadsSearchFilterBar";
import CardPagination from "@/global/elements/table/CardPagination";
import LeadFollowUpNotes from "./_components/followUpNotes/LeadFollowUpNotes";
import { useFollowUpNoteFormHook } from "./_components/followUpNotes/useFollowUpFormDataHook";
import LeadTable from "./_components/listLeads/LeadTable";
import { NewLeadPayload } from "@root/apiGateway";

export const leadsMock: NewLeadPayload[] = [
  {
    id: 1,
    fullName: "Rohit Sharma",
    emailAddress: "rohit.sharma@example.com",
    phoneNo: "9876543210",
    companyName: "Alpha Investments Pvt Ltd",
    leadSource: "LinkedIn",
    bondType: "Corporate Bond",
    status: "Active",
    exInvestmentAmount: 500000,
    note: "Interested in medium-term bonds",
    createdBy: 101,
    createdAt: "2025-10-01T10:45:00Z",
    updatedAt: "2025-10-10T15:20:00Z",
  },
  {
    id: 2,
    fullName: "Neha Verma",
    emailAddress: "neha.verma@example.com",
    phoneNo: "9823456712",
    companyName: "Beta Capital Advisors",
    leadSource: "Referral",
    bondType: "Government Bond",
    status: "Pending",
    exInvestmentAmount: 250000,
    note: "Requested details for tax-saving bonds",
    createdBy: 102,
    createdAt: "2025-09-25T09:30:00Z",
    updatedAt: "2025-10-05T13:15:00Z",
  },
  {
    id: 3,
    fullName: "Aman Gupta",
    emailAddress: "aman.gupta@example.com",
    phoneNo: "9988776655",
    companyName: "WealthGrow Inc.",
    leadSource: "Website Form",
    bondType: "Convertible Bond",
    status: "Closed",
    exInvestmentAmount: null,
    note: "Invested elsewhere",
    createdBy: 103,
    createdAt: "2025-09-15T14:00:00Z",
    updatedAt: "2025-09-28T16:10:00Z",
  },
  {
    id: 4,
    fullName: "Priya Nair",
    emailAddress: "priya.nair@example.com",
    phoneNo: "9123456789",
    companyName: "NextGen Finance",
    leadSource: "Cold Call",
    bondType: "Municipal Bond",
    status: "Follow Up",
    exInvestmentAmount: 150000,
    note: "Requested call back after Diwali",
    createdBy: 104,
    createdAt: "2025-10-05T12:20:00Z",
    updatedAt: "2025-10-12T18:00:00Z",
  },
  {
    id: 5,
    fullName: "Vikas Mehta",
    emailAddress: "vikas.mehta@example.com",
    phoneNo: "9900123456",
    companyName: "Prime Wealth Partners",
    leadSource: "Email Campaign",
    bondType: "Corporate Bond",
    status: "Active",
    exInvestmentAmount: 750000,
    note: "Interested in long-term corporate bonds",
    createdBy: 105,
    createdAt: "2025-10-02T08:45:00Z",
    updatedAt: "2025-10-15T17:40:00Z",
  },
];


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
          <LeadTable data={leadsMock}/>
        </CardContent>
        <CardPagination onClick={() => {}} page={3} totalPages={10} />
      </Card>
    </div>
  );
}

export default LeadsView;
