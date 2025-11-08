import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import ShowOnly from "@/global/elements/permissions/ShowOnly";
import { CustomerProfile } from "@root/apiGateway";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import { useCustomerTableActions } from "./useCustomerTableActionHook";

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
          <Button variant="ghost" className="p-0 w-8 h-8">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}

          {/* <DropdownMenuSeparator /> */}
          <ShowOnly
            condition={
              profile.createdBy != null && profile.kycStatus === "PENDING"
            }
          >
            <DropdownMenuItem onClick={handleProfileUpdate}>
              Customer Edit
            </DropdownMenuItem>
          </ShowOnly>

          <DropdownMenuItem onClick={handleViewKyc}>View KYC</DropdownMenuItem>
          <DropdownMenuItem onClick={handleProfileView}>
            View Profile
          </DropdownMenuItem>

          <AllowOnlyView permissions={["delete:customer"]}>
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
          </AllowOnlyView>

          <AllowOnlyView permissions={["delete:customer"]}>
            <DropdownMenuItem
              className="bg-red-50 mt-1 text-red-500"
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
          </AllowOnlyView>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CustomerTableActions;
