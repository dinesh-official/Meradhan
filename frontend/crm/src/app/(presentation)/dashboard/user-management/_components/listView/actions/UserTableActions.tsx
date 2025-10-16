import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowPopup(true)}>
            Edit Profile
          </DropdownMenuItem>

          <HideForMe userId={profile.id}>
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
