"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { queryClient } from "@/core/config/reactQuery";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import apiGateway, { ApiError, ITrashCustomer } from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

// Hook for trash actions
const useCustomerTrashActions = () => {
  const customerApi = new apiGateway.trash.TrashAPI(apiClientCaller);

  const restoreCustomerMutation = useMutation({
    mutationKey: ["restoreCustomer"],
    mutationFn: async (customerId: number) => {
      // For now, just use the customer API to update status
      const response = await customerApi.restoreCustomersInTrash(customerId);
      return response.responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customersTrash"] });
      queryClient.invalidateQueries({ queryKey: ["searchCustomersList"] });
      toast.success("Customer restored successfully");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(
          error.response?.data?.message || "Failed to restore customer"
        );
      } else {
        toast.error("Something went wrong while restoring customer");
      }
    },
  });

  const deleteCustomerPermanentlyMutation = useMutation({
    mutationKey: ["deleteCustomerPermanently"],
    mutationFn: async (customerId: number) => {
      // Use the existing delete method to permanently delete
      const response = await customerApi.deleteCustomersPermanently(customerId);
      return response.responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customersTrash"] });
      toast.success("Customer permanently deleted");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(
          error.response?.data?.message ||
            "Failed to delete customer permanently"
        );
      } else {
        toast.error("Something went wrong while deleting customer");
      }
    },
  });

  return {
    restoreCustomerMutation,
    deleteCustomerPermanentlyMutation,
  };
};

// Action buttons component
const TrashActionButtons = ({ customer }: { customer: ITrashCustomer }) => {
  const { restoreCustomerMutation, deleteCustomerPermanentlyMutation } =
    useCustomerTrashActions();

  const handleRestore = async () => {
    const result = await Swal.fire({
      title: "Restore Customer?",
      text: `Are you sure you want to restore ${customer.firstName} ${customer.lastName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Restore!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      restoreCustomerMutation.mutate(customer.id);
    }
  };

  const handleDeletePermanently = async () => {
    const result = await Swal.fire({
      title: "Delete Permanently?",
      text: `This will permanently delete ${customer.firstName} ${customer.lastName}. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete Forever!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // Second confirmation for permanent deletion
      const finalConfirm = await Swal.fire({
        title: "Final Confirmation",
        text: "This is your final warning. The customer data will be permanently deleted and cannot be recovered.",
        icon: "error",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "DELETE FOREVER",
        cancelButtonText: "Cancel",
      });

      if (finalConfirm.isConfirmed) {
        deleteCustomerPermanentlyMutation.mutate(customer.id);
      }
    }
  };

  return (
    <div className="w-24" >
        <div className="flex gap-2 w-full">
      <AllowOnlyView permissions={["edit:bin", "edit:customer"]}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestore}
          disabled={
            restoreCustomerMutation.isPending ||
            deleteCustomerPermanentlyMutation.isPending
          }
          className="hover:bg-green-50 border-green-200 text-green-600 hover:text-green-700"
        >
          {restoreCustomerMutation.isPending ? (
            <Spinner className="mr-1 w-4 h-4" />
          ) : (
            <RotateCcw className="mr-1 w-4 h-4" />
          )}
          {restoreCustomerMutation.isPending ? "Restoring..." : "Restore"}
        </Button>
      </AllowOnlyView>

      <AllowOnlyView permissions={["delete:bin", "delete:customer"]}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeletePermanently}
          disabled={
            deleteCustomerPermanentlyMutation.isPending ||
            restoreCustomerMutation.isPending
          }
          className="hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700"
        >
          {deleteCustomerPermanentlyMutation.isPending ? (
            <Spinner className="mr-1 w-4 h-4" />
          ) : (
            <Trash2 className="mr-1 w-4 h-4" />
          )}
          {deleteCustomerPermanentlyMutation.isPending
            ? "Deleting..."
            : "Delete Forever"}
        </Button>
      </AllowOnlyView>
    </div>
  </div>

  );
};

export function CustomersTrash() {
  const trashApi = new apiGateway.trash.TrashAPI(apiClientCaller);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customersTrash"],
    queryFn: async () => {
      try {
        const response = await trashApi.getCustomersInTrash();
        return response.responseData || [];
      } catch {
        // If the trash API doesn't exist or fails, return empty array
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once
  });

  if (error && !data) {
    return (
      <Card className="mt-5">
        <CardContent className="flex justify-center items-center h-96">
          <div className="text-center">
            <Trash2 className="mx-auto mb-4 w-12 h-12 text-red-300" />
            <p className="mb-2 font-medium text-red-600">
              Failed to load trash data
            </p>
            <p className="mb-4 text-gray-500 text-sm">
              {error instanceof ApiError
                ? error.response?.data?.message
                : "Something went wrong"}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw className="mr-1 w-4 h-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-5">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Deleted Customers ({data?.length || 0})
            </CardTitle>
            <p className="mt-1 text-gray-600 text-sm">
              Manage deleted customers - restore them or remove them permanently
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Trash2 className="mx-auto mb-4 w-12 h-12 text-gray-300" />
              <p className="font-medium text-gray-500 text-lg">
                Trash is empty
              </p>
              <p className="text-gray-400 text-sm">
                No deleted customers found
              </p>
            </div>
          </div>
        ) : (
          <UniversalTable<ITrashCustomer>
            data={data}
            isLoading={isLoading}
            initialPageSize={10}
            getRowIdAction={(row) =>
              row?.id?.toString() || row.userName?.toString()
            }
            fields={[
              {
                key: "name",
                label: "Customer Name",
                cell: (row) => (
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {[
                        row.firstName?.trim(),
                        row.middleName?.trim(),
                        row.lastName?.trim(),
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </span>
                    {row.userName && (
                      <span className="text-muted-foreground text-xs">
                        @{row.userName}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: "email",
                label: "Contact Info",
                cell: (row) => (
                  <div className="flex flex-col">
                    <span className="text-sm">{row.emailAddress}</span>
                    <span className="text-muted-foreground text-xs">
                      {row.phoneNo || "N/A"}
                    </span>
                  </div>
                ),
              },
              {
                key: "userType",
                label: "Type",
                cell: (row) => (
                  <span className="text-sm capitalize">
                    {row.userType || "N/A"}
                  </span>
                ),
              },
              {
                key: "kycStatus",
                label: "KYC Status",
                cell: (row) => <StatusBadge value={row.kycStatus} />,
              },

              {
                key: "actions",
                label: "Actions",
                stickyRight: true,
                sortable: false,
                
                cell: (row) => <TrashActionButtons customer={row} />,
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
