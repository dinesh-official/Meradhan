import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import HideForMe from "@/global/elements/permissions/HideForMe";
import { CrmUsersProfile } from "@root/apiGateway";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import UpdateUserPopup from "../../mangeuser/UpdateUserPopup";
import { useUserActionHook } from "./useUserActionHook";

function UserTableActions({ profile }: { profile: CrmUsersProfile }) {
  const { deleteUserMutation, manageSuspendUserMutation } = useUserActionHook();
  const [showPopup, setShowPopup] = useState(false);

  const status =
    profile.accountStatus == "ACTIVE" ? "Suspend account" : "Active account";

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
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuSeparator />
          <AllowOnlyView permissions={["edit:user"]}>
            <DropdownMenuItem onClick={() => setShowPopup(true)}>
              Edit Profile
            </DropdownMenuItem>
          </AllowOnlyView>

          <HideForMe userId={profile.id}>
            <AllowOnlyView permissions={["edit:user"]}>
              <DropdownMenuItem
                onClick={async () => {
                  const result = await Swal.fire({
                    title: "Are you sure?",
                    text: `This action will ${status} the user.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Yes, Do it!",
                    cancelButtonText: "Cancel",
                  });
                  if (result.isConfirmed) {
                    manageSuspendUserMutation.mutate({
                      id: profile.id,
                      status:
                        profile.accountStatus == "ACTIVE"
                          ? "SUSPENDED"
                          : "ACTIVE",
                    });
                  }
                }}
              >
                {status}
              </DropdownMenuItem>
            </AllowOnlyView>
            <AllowOnlyView permissions={["delete:user"]}>
              <DropdownMenuItem
                className="bg-red-50 text-red-500"
                onClick={async () => {
                  const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "This action will permanently delete the user.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "Cancel",
                  });

                  if (result.isConfirmed) {
                    deleteUserMutation.mutate(profile.id);
                  }
                }}
              >
                Delete Account
              </DropdownMenuItem>
            </AllowOnlyView>
          </HideForMe>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateUserPopup
        user={profile}
        showPopup={showPopup}
        onPopupClose={setShowPopup}
      />
    </>
  );
}

export default UserTableActions;
