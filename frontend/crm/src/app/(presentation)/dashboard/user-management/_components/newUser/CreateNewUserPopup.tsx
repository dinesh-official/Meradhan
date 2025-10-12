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
import { ReactNode, useEffect, useState } from "react";
import { useCreateUserDataHook } from "./forms/useCreateUserFormDataHook";
import UserManageForm from "./forms/userManageForm";

function CreateNewUserPopup({ children }: { children: ReactNode }) {
  const manager = useCreateUserDataHook();
  const [open, setOpen] = useState(false);
  const { resetUserData } = manager;

  useEffect(() => {
    if (open) resetUserData();
  }, [open, resetUserData]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={manager.validateUserData}>Save User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewUserPopup;
