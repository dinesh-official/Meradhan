"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Loader2, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  onCountChange?: (listId: number, newCount: number) => void;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline confirm state — no Swal, no external DOM, no focus conflict
  const [confirmMember, setConfirmMember] = useState<Member | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

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
      setConfirmMember(null);
      setRemoveError(null);
    }
  }, [open, loadMembers]);

  const handleConfirmRemove = async () => {
    if (!confirmMember) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      const res = await api.removeSavedListMember(list.id, confirmMember.customerProfileId);
      const data = res.data as ApiResponse<{ _count?: { members: number } }>;
      const newCount = data.responseData?._count?.members ?? 0;
      setMembers((prev) =>
        prev.filter((m) => m.customerProfileId !== confirmMember.customerProfileId)
      );
      onCountChange?.(list.id, newCount);
      setConfirmMember(null);
    } catch (e) {
      setRemoveError(extractMsg(e));
    } finally {
      setRemoving(false);
    }
  };

  const memberCount = members.length;

  return (
    <>
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
                          disabled={removing && confirmMember?.customerProfileId === m.customerProfileId}
                          onClick={() => { setRemoveError(null); setConfirmMember(m); }}
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

      {/* Inline confirmation — rendered as a sibling so it doesn't nest inside the member Dialog */}
      <AlertDialog
        open={confirmMember !== null}
        onOpenChange={(v) => { if (!v && !removing) setConfirmMember(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>
                {confirmMember?.customerProfile.firstName}{" "}
                {confirmMember?.customerProfile.lastName}
              </strong>{" "}
              will be permanently removed from this list.
              {removeError && (
                <span className="block mt-2 text-destructive text-sm">{removeError}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={removing}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmRemove();
              }}
            >
              {removing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Removing…
                </span>
              ) : (
                "Yes, remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
