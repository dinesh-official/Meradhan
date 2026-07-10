"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CrmUsersProfile } from "@root/apiGateway";
import UserManageForm from "./forms/UserManageForm";
import { useManageUserDataHook } from "./forms/hooks/useManageUserDataHook";

function UpdateUserPopup({
  user,
  showPopup,
  onPopupClose,
}: {
  user: CrmUsersProfile;
  showPopup?: boolean;
  onPopupClose: (e: boolean) => void;
}) {
  const manager = useManageUserDataHook({
    email: user.email,
    name: user.name,
    phoneNo: user.phoneNo,
    role: user.role,
  });
  const { popup } = manager;

  return (
    <Dialog
      open={popup.open || showPopup}
      onOpenChange={(e) => {
        popup.setOpen(e);
        onPopupClose?.(e);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Profile</DialogTitle>
        </DialogHeader>
        <UserManageForm manager={manager} />
        <DialogFooter>
          <Button
            variant={`secondary`}
            onClick={() => {
              popup.setOpen(false);
              onPopupClose?.(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              manager.validateAndUpdateUserData(user.id);
            }}
            disabled={manager.updateUserMutation.isPending}
          >
            Update User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateUserPopup;
