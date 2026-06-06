"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway, { CrmUserBase } from "@root/apiGateway";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRoundSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const crmUsersApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);

export default function ImpersonateUserView() {
  const currentUser = useCurrentUserData((s) => s.user);
  const { setCookie } = useAppCookie();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<CrmUserBase | null>(null);

  const usersQuery = useQuery({
    queryKey: ["impersonate-users", page, search],
    queryFn: async () => {
      const response = await crmUsersApi.findUsers({
        page: String(page),
        search: search || undefined,
        status: "ACTIVE",
      });
      return response.data.responseData;
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (targetUserId: number) => {
      const response = await fetch("/api/auth/impersonate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to impersonate user");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Now viewing as ${data.name}`);
      queryClient.clear();
      useCurrentUserData.getState().setUserData({
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNo: data.phoneNo,
        avatar: data.avatar,
        role: data.role,
        permissions: data.permissions ?? [],
        impersonatedBy: data.impersonatedBy ?? null,
      });
      setCookie("token", data.token, { path: "/" });
      setCookie("userId", String(data.id), { path: "/" });
      setCookie("role", data.role, { path: "/" });
      window.location.replace("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rows = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  const filteredRows = useMemo(
    () => rows.filter((user) => user.id !== currentUser?.id),
    [rows, currentUser?.id],
  );

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Impersonate User"
        description="Switch into another active CRM user's session to verify permissions and workflows. No OTP is required."
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-sm"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPage(1);
                setSearch(searchInput.trim());
              }}
            >
              Search
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!usersQuery.isLoading && filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No active users found.
                    </TableCell>
                  </TableRow>
                )}

                {!usersQuery.isLoading &&
                  filteredRows.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.accountStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          disabled={impersonateMutation.isPending}
                          onClick={() => setSelectedUser(user)}
                        >
                          <UserRoundSearch className="size-4" />
                          Impersonate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {meta && meta.totalPages > 1 && (
            <CardPagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Impersonate this user?</AlertDialogTitle>
            <AlertDialogDescription>
              You will view the CRM as{" "}
              <strong>{selectedUser?.name}</strong> ({selectedUser?.email}). You
              can exit impersonation at any time from the banner at the top.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              disabled={impersonateMutation.isPending}
              onClick={() => {
                if (selectedUser) {
                  setSelectedUser(null);
                  impersonateMutation.mutate(selectedUser.id);
                }
              }}
            >
              {impersonateMutation.isPending
                ? "Switching..."
                : "Confirm impersonation"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
