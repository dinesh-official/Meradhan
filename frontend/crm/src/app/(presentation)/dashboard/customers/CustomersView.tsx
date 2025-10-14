"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import CustomerSearchFilterBar from "./_components/CustomerSearchFilterBar";
import CustomerTable, { Customer } from "./_components/CustomerTable";
const customersMock: Customer[] = [
    {
      id: "1",
      name: "Working Bapari",
      email: "sourav0w@gmail.com",
      phone: "9382156026",
      company: "Alpha Corp",
      panNumber: "WORBP8123A",
      kycStatus: "Pending",
      status: "Active",
      totalInvestment: 0,
      leadId: "LD4001",
      username: "working.b",
      dematAccount: "DEMAT1001",
      relationshipManager: "Rohan Singh",
      createdAt: "3 months ago",
      updatedAt: "19 days ago",
    },
    {
      id: "2",
      name: "Vikas Kukreja",
      email: "vikas.kukreja83@gmail.com",
      phone: "9910286723",
      company: "Beta Traders",
      panNumber: "VIKPK6139M",
      kycStatus: "Pending",
      status: "Active",
      totalInvestment: 0,
      leadId: "LD4002",
      username: "vikas.k",
      dematAccount: "DEMAT1002",
      relationshipManager: "Amit Yadav",
      createdAt: "3 months ago",
      updatedAt: "3 months ago",
    },
    {
      id: "3",
      name: "Neha Sharma",
      email: "neha.sharma@example.com",
      phone: "9876543210",
      company: "Zenith Finserv",
      panNumber: "NEXPS4432Q",
      kycStatus: "Verified",
      status: "Active",
      totalInvestment: 250000,
      leadId: "LD4003",
      username: "neha.s",
      dematAccount: "DEMAT1003",
      relationshipManager: "Rohan Singh",
      createdAt: "5 months ago",
      updatedAt: "2 months ago",
    },
    {
      id: "4",
      name: "Arjun Patel",
      email: "arjun.patel@example.com",
      phone: "9898123456",
      company: "Gamma Capital",
      panNumber: "ARJPP9834T",
      kycStatus: "Verified",
      status: "Active",
      totalInvestment: 420000,
      leadId: "LD4004",
      username: "arjunp",
      dematAccount: "DEMAT1004",
      relationshipManager: "Nisha Gupta",
      createdAt: "1 year ago",
      updatedAt: "4 months ago",
    },
  ];

function CustomersView() {
  
  return (
    <div>
      <PageInfoBar
        title="Customer Management"
        description="Manage customer profiles and KYC status"
        actions={
          <Link href={`/dashboard/customers/create`}>
            <Button>
              <Plus /> Add New Customer
            </Button>
          </Link>
        }
      />

      <Card className="mt-5">
        <CustomerSearchFilterBar />
        <CardContent>
          <CustomerTable data={customersMock}/>
        </CardContent>
        <CardPagination onClick={() => {}} page={3} totalPages={10} />
      </Card>
    </div>
  );
}

export default CustomersView;
