import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import ShowOnly from "@/global/elements/permissions/ShowOnly";
import { encodeId } from "@/global/utils/url.utils";
import { CustomerProfile } from "@root/apiGateway";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useCustomerTableActions } from "./useCustomerTableActionHook";
import { useUserTracking } from "@/analytics/UserTrackingProvider";

const CustomerTableActions = ({ profile }: { profile: CustomerProfile }) => {
  const { trackActivity } = useUserTracking();
  const {
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
          <ShowOnly
            condition={
              profile.createdBy != null && profile.kycStatus === "PENDING"
            }
          >
            <DropdownMenuItem onClick={handleProfileUpdate}>
              Customer Edit
            </DropdownMenuItem>
          </ShowOnly>

          <AllowOnlyView permissions={["view:customerkyc"]}>
            {profile.userType === "CORPORATE" ? (
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/customers/view/${encodeId(profile.id)}/corporate-kyc`}
                >
                  View Corporate KYC
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/view/${encodeId(profile.id)}/kyc`}>
                  View KYC
                </Link>
              </DropdownMenuItem>
            )}
          </AllowOnlyView>
          <DropdownMenuItem onClick={handleProfileView}>
            View Profile
          </DropdownMenuItem>

          <AllowOnlyView permissions={["delete:customer"]} condition={profile.kycStatus !== "PENDING"}>
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
                  trackActivity("update_entry", {
                    customerId: profile.id,
                    reason: `update customer profile status | ID: ${profile.id
                      } | Status: ${profile.utility.accountStatus === "ACTIVE"
                        ? "SUSPENDED"
                        : "ACTIVE"
                      } | Name: ${profile.firstName} ${profile.lastName}`,
                  });
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

          <AllowOnlyView permissions={["delete:customer"]} >
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
                  trackActivity("delete_entry", {
                    customerId: profile.id,
                    reason: `Attempting to delete customer profile | ID: ${profile.id} Name: ${profile.firstName} ${profile.lastName}`,
                  });
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
