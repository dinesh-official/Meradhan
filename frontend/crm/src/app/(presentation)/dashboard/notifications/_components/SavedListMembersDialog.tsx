"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { Users, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";

/* ─── types ─────────────────────────────────────────────────── */

export type SavedListForDialog = {
  id: number;
  name: string;
  _count?: { members: number };
};

export type Member = {
  id: number;
  savedListId: number;
  customerProfileId: number;
  addedAt: string;
  customerProfile: {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    phoneNo: string | null;
    emailAddress: string;
  };
};

type ApiResponse<T> = { responseData?: T };

function extractMsg(e: unknown): string {
  if (
    e &&
    typeof e === "object" &&
    "response" in e &&
    (e as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (e as { response: { data: { message: string } } }).response.data.message;
  }
  return "An unexpected error occurred.";
}

/* ─── component ─────────────────────────────────────────────── */

export default function SavedListMembersDialog({
  list,
  open,
  onOpenChange,
  onCountChange,
}: {
  list: SavedListForDialog;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called after a member is removed with the new member count */
  onCountChange?: (listId: number, newCount: number) => void;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.savedListMembers(list.id);
      const data = res.data as ApiResponse<Member[]>;
      setMembers(data.responseData ?? []);
    } catch {
      setError("Could not load list members.");
    } finally {
      setLoading(false);
    }
  }, [list.id]);

  useEffect(() => {
    if (open) {
      loadMembers();
    } else {
      setMembers([]);
    }
  }, [open, loadMembers]);

  const handleRemove = async (member: Member) => {
    const confirm = await Swal.fire({
      title: "Remove member?",
      text: `${member.customerProfile.firstName} ${member.customerProfile.lastName} will be permanently removed from this list.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    setRemovingId(member.customerProfileId);
    try {
      const res = await api.removeSavedListMember(list.id, member.customerProfileId);
      const data = res.data as ApiResponse<{ _count?: { members: number } }>;
      const newCount = data.responseData?._count?.members ?? 0;
      setMembers((prev) => prev.filter((m) => m.customerProfileId !== member.customerProfileId));
      onCountChange?.(list.id, newCount);
    } catch (e) {
      await Swal.fire("Failed", extractMsg(e), "error");
    } finally {
      setRemovingId(null);
    }
  };

  const memberCount = members.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {list.name}
            <Badge variant="secondary">
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {memberCount > 200 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            This list has {memberCount} members. Showing all — scroll to view.
          </p>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-destructive">{error}</div>
          ) : members.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No members in this list.
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-muted z-10">
                <tr>
                  <th className="text-left p-3 font-medium border-b">#</th>
                  <th className="text-left p-3 font-medium border-b">Username</th>
                  <th className="text-left p-3 font-medium border-b">Name</th>
                  <th className="text-left p-3 font-medium border-b">Phone</th>
                  <th className="text-left p-3 font-medium border-b">Email</th>
                  <th className="p-3 border-b w-16"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => (
                  <tr
                    key={m.customerProfileId}
                    className="odd:bg-background even:bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <td className="p-3 text-muted-foreground">{idx + 1}</td>
                    <td className="p-3 font-mono text-sm text-muted-foreground">
                      @{m.customerProfile.userName}
                    </td>
                    <td className="p-3 font-medium">
                      {m.customerProfile.firstName} {m.customerProfile.lastName}
                    </td>
                    <td className="p-3 font-mono text-sm">
                      {m.customerProfile.phoneNo ?? (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">{m.customerProfile.emailAddress}</td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                        disabled={removingId === m.customerProfileId}
                        onClick={() => handleRemove(m)}
                        title="Remove from list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
