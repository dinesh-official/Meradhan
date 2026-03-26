"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useEffect } from "react";
import UserManageForm from "./forms/UserManageForm";
import { useManageUserDataHook } from "./forms/hooks/useManageUserDataHook";

function CreateNewUserPopup({ children }: { children: ReactNode }) {
  const manager = useManageUserDataHook();
  const { resetUserData, popup } = manager;

  useEffect(() => {
    if (popup.open) resetUserData();
  }, [popup.open, resetUserData]);

  return (
    <Dialog open={popup.open} onOpenChange={popup.setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <UserManageForm manager={manager} />
        <DialogFooter>
          <Button
            variant={`secondary`}
            onClick={() => {
              popup.setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              manager.validateAndCreateUserData();
            }}
            disabled={manager.createUserMutation.isPending}
          >
            Save User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewUserPopup;
