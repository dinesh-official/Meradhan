"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import Table from "../Table";
import CustomerSearchFilterBar from "./_components/CustomerSearchFilterBar";
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
          <Table />
        </CardContent>
        <CardPagination onClick={() => {}} page={3} totalPages={10} />
      </Card>
    </div>
  );
}

export default CustomersView;
