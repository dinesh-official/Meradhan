"use client";
import { Plus, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function IsshuerNotesAddToWatchList({ issuerId }: { issuerId: string }) {
  const [open, setOpen] = useState(false);
  const { cookies } = useAppCookie();

  // Fetch issuer notes watchlist
  const issuerWatchList = useQuery({
    queryKey: ["issuerWatchList"],
    queryFn: async () =>
      await apiClientCaller.get<string[]>("/watchlist/issuer"),
  });

  // Add to watchlist mutation
  const addToWatchList = useMutation({
    mutationKey: ["addIssuerWatchList", issuerId],
    mutationFn: async () =>
      await apiClientCaller.get("/watchlist/issuer/manage", {
        params: { issuerId },
      }),
    onSuccess: () => {
      issuerWatchList.refetch();
      toast.success("Added to Watchlist");
    },
    onError: () => {
      issuerWatchList.refetch();
      toast.error("Failed to add Watchlist");
    },
  });

  // Check if issuer exists in watchlist
  const exists = issuerWatchList.data?.data?.some(
    (i: string) => i === issuerId
  );

  // If already in watchlist
  if (exists) {
    return (
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="rounded-sm p-[2px]">
          <Eye size={16} />
        </div>
        <p className="font-medium text-gray-500 text-sm">Watched</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => {
          if (!cookies.userId) {
            setOpen(true);
            return;
          }
          addToWatchList.mutate();
        }}
      >
        <div className="bg-secondary rounded-sm p-[2px]">
          <Plus size={18} className="text-white" />
        </div>
        <p className="font-medium text-gray-500">Watchlist</p>
      </div>

      {/* Login Required Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You must be logged in to add issuer notes to your watchlist.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                localStorage.setItem("issuesNotesWatchList", issuerId);
                window.location.href = `/login?taskId=${issuerId}&type=issuer-notes`;
              }}
              className="px-4 py-2 rounded-md bg-secondary text-white text-sm cursor-pointer"
            >
              Login Now
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default IsshuerNotesAddToWatchList;
