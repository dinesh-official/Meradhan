"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { canAccessNotifications } from "@/global/utils/role.utils";
import apiGateway from "@root/apiGateway";
import { format } from "date-fns";
import { Eye, List, Search, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import SavedListMembersDialog, {
  type SavedListForDialog,
} from "../_components/SavedListMembersDialog";

/* ─── types ─────────────────────────────────────────────────── */

type CrmUser = { id: number; name: string; email: string };
type SavedList = SavedListForDialog & {
  createdAt: string;
  updatedAt: string;
  createdBy: CrmUser;
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

export default function NotificationListsView() {
  const { cookies } = useAppCookie();
  const [mounted, setMounted] = useState(false);

  const [lists, setLists] = useState<SavedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [dialogList, setDialogList] = useState<SavedList | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);

  const isAdmin =
    cookies.role === "ADMIN" || cookies.role === "SUPER_ADMIN";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.listSavedLists();
        const data = res.data as ApiResponse<SavedList[]>;
        if (!cancelled) setLists(data.responseData ?? []);
      } catch {
        if (!cancelled) setLists([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenDialog = (list: SavedList) => {
    setDialogList(list);
    setDialogOpen(true);
  };

  const handleCountChange = (listId: number, newCount: number) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, _count: { members: newCount } } : l
      )
    );
    if (dialogList?.id === listId) {
      setDialogList((prev) =>
        prev ? { ...prev, _count: { members: newCount } } : prev
      );
    }
  };

  const handleDelete = async (list: SavedList) => {
    const confirmed = await Swal.fire({
      title: "Delete list?",
      html: `<strong>${list.name}</strong> will be deleted.<br/>This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!confirmed.isConfirmed) return;

    setDeletingId(list.id);
    try {
      await api.deleteSavedList(list.id);
      setLists((prev) => prev.filter((l) => l.id !== list.id));
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: `"${list.name}" has been deleted.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      await Swal.fire("Failed", extractMsg(e), "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted) return null;
  if (!canAccessNotifications(cookies.role)) {
    return (
      <div className="p-8 text-center text-destructive">
        You do not have access to notifications.
      </div>
    );
  }

  const filteredLists = search.trim()
    ? lists.filter((l) =>
        l.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : lists;

  return (
    <div className="p-4 space-y-4">
      <PageInfoBar
        title="Notification Lists"
        description="All saved customer lists used for notifications."
      />

      {/* Search bar — only show once lists have loaded */}
      {!loading && lists.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by list name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <List className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              No saved lists yet. Create one from the{" "}
              <span className="font-medium">Customer List</span> page.
            </p>
          </CardContent>
        </Card>
      ) : filteredLists.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              No lists match <span className="font-medium">&ldquo;{search}&rdquo;</span>.
            </p>
            <Button variant="link" size="sm" onClick={() => setSearch("")} className="mt-1">
              Clear search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-180px)] space-y-2 pr-1">
          {filteredLists.map((list) => {
            const memberCount = list._count?.members ?? 0;
            return (
              <Card key={list.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{list.name}</span>
                      <Badge variant="secondary" className="shrink-0">
                        <Users className="w-3 h-3 mr-1" />
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {format(new Date(list.createdAt), "dd MMM yyyy")}
                      {isAdmin && (
                        <span className="ml-2">
                          &mdash; by{" "}
                          <span className="font-medium">{list.createdBy.name}</span>
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(list)}
                      className="gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View customers
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      disabled={deletingId === list.id}
                      onClick={() => handleDelete(list)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {dialogList && (
        <SavedListMembersDialog
          list={dialogList}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCountChange={handleCountChange}
        />
      )}
    </div>
  );
}
