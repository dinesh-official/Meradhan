import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerProfile } from "@root/apiGateway";
import { MoreHorizontal } from "lucide-react";
import { useCustomerTableActions } from "./customerTableActionHook";
import Swal from "sweetalert2";

const CustomerTableActions = ({ profile }: { profile: CustomerProfile }) => {
  const {
    handleViewKyc,
    handleProfileView,
    handleProfileUpdate,
    deleteProfileMutation,
    manageSuspendCustomerMutation,
  } = useCustomerTableActions({
    profileId: profile.id,
  });

  const status =
    profile.utility.accountStatus == "ACTIVE"
      ? "Suspend account"
      : "Active account";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileUpdate}>
            Customer Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={async () => {
              const result = await Swal.fire({
                title: "Are you sure?",
                text: `Are you sure you want to ${status} ?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: `Yes, do it!`,
                cancelButtonText: "Cancel",
              });

              if (result.isConfirmed) {
                // ✅ Pass correct payload
                manageSuspendCustomerMutation.mutate({
                  data: {
                    status:
                      profile.utility.accountStatus === "ACTIVE"
                        ? "SUSPENDED"
                        : "ACTIVE", // toggle logic
                  },
                  customerId: String(profile.id), // or whatever your id variable is
                });
              }
            }}
          >
            {status}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewKyc}>View KYC</DropdownMenuItem>
          <DropdownMenuItem onClick={handleProfileView}>
            View Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            className="bg-red-50 text-red-500 mt-1"
            onClick={async () => {
              const result = await Swal.fire({
                title: "Are you sure?",
                text: "This action will permanently delete the customer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
              });

              if (result.isConfirmed) {
                deleteProfileMutation.mutate();
              }
            }}
          >
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CustomerTableActions;
