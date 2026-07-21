"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import ServiceRequestsFilterBar from "./_components/ServiceRequestsFilterBar";
import ServiceRequestsTable from "./_components/ServiceRequestsTable";
import { useServiceRequestsApiHook } from "./_hooks/useServiceRequestsApiHook";

export default function ServiceRequestsView() {
  const { filters, setFilters, query, closeMutation, rejectMutation } =
    useServiceRequestsApiHook();
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div>
      <PageInfoBar
        title="Service Requests"
        description="Review and action customer account closure requests"
      />
      <Card className="mt-5">
        <ServiceRequestsFilterBar filters={filters} setFilters={setFilters} />
        <CardContent>
          {query.isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No service requests found.
            </p>
          ) : (
            <ServiceRequestsTable
              rows={rows}
              closeMutation={closeMutation}
              rejectMutation={rejectMutation}
            />
          )}
        </CardContent>
        {meta && meta.totalPages > 1 && (
          <CardPagination
            page={filters.page}
            totalPages={meta.totalPages}
            onPageChange={(page) => setFilters({ page })}
          />
        )}
      </Card>
    </div>
  );
}
