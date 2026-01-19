"use client";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { BondDetailsResponse } from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

function BondAddToWatchList({ isin }: { isin: string }) {
  const [open, setOpen] = useState(false);
  const { cookies } = useAppCookie();

  // Fetch WatchList
  const bondsWatchList = useQuery({
    queryKey: ["bondsWatchList"],
    queryFn: async () => {
      if (!cookies.userId) {
        return { data: [] };
      }
      return await apiClientCaller.get<BondDetailsResponse[]>(
        "/watchlist/bonds"
      );
    },
  });

  // Add To WatchList Mutation
  const addToWatchList = useMutation({
    mutationKey: ["addBondsWatchList", isin],
    mutationFn: async () =>
      await apiClientCaller.get("/watchlist/bonds/manage", {
        params: { isin },
      }),
    onSuccess: () => {
      bondsWatchList.refetch();
      toast.success("Added To WatchList");
    },
    onError: () => {
      bondsWatchList.refetch();
      toast.error("Failed To Add WatchList");
    },
  });

  // Check if ISIN exists in watchList
  const exists = bondsWatchList.data?.data?.some((b) => b.isin === isin);

  // If exists, show watched UI
  if (exists) {
    return (
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="rounded-sm p-[2px]">
          <Eye size={15} />
        </div>
        <p className="font-medium text-gray-500 text-sm">Watched</p>
      </div>
    );
  }

  // MAIN RETURN
  return (
    <>
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => {
          if (cookies.userId) {
            addToWatchList.mutate();
          } else {
            setOpen(true); // open login needed modal
          }
        }}
      >
        <div className="bg-secondary rounded-sm p-0.5">
          <Plus size={15} className="text-white" />
        </div>
        <p className="font-medium text-gray-500 text-sm">WatchList</p>
      </div>

      {/* LOGIN REQUIRED DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You must be logged in to add bonds to your watchList.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                localStorage.setItem("bondsWatchList", isin);
                window.location.href = `/login?taskId=${isin}&type=bond`;
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

export default BondAddToWatchList;
