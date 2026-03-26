"use client";
import { PartnershipPayload } from "@root/apiGateway";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { encodeId } from "@/global/utils/url.utils";
import { Route } from "next";

interface PartnershipTableActionsProps {
  partnership: PartnershipPayload;
}

function PartnershipTableActions({
  partnership,
}: PartnershipTableActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const partnershipApi = new apiGateway.crm.crmPartnership.CrmPartnershipApi(
    apiClientCaller
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await partnershipApi.deletePartnership(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchPartnershipsQuery"] });
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Partnership deleted successfully",
      });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete partnership",
      });
    },
  });

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(partnership.id);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            router.push(
              `/dashboard/leads/partnerships/${encodeId(partnership.id)}` as Route
            );
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            router.push(
              `/dashboard/leads/partnerships/${encodeId(partnership.id)}/update` as Route
            );
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default PartnershipTableActions;

