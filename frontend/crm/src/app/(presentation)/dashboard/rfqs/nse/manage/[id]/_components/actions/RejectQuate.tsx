"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { ApiError, CreateRfqResponseItem } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
function RejectQuate({ data }: { data: CreateRfqResponseItem }) {
  const router = useRouter();
  const [role, setRole] = useState<"I" | "R">("I");

  const rejectQuoteMutation = useMutation({
    mutationKey: ["rejectQuote", data.id],
    mutationFn: async () => {
      // Replace with actual API call to accept the quote
      //   return await rfqApi.quoteTermination({
      //     rfqNumber: data.number,
      //     // id: data.id,
      //     role: role,
      //   });
    },
    onSuccess: () => {
      // Handle success (e.g., show a success message, refresh data)
      toast.success("Quote accepted successfully");
      router.back();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.response?.data?.responseData) {
          toast.error(error.response.data.responseData.join("<br/>"));
        } else {
          toast.error(error.message || "Failed to accept quote");
        }
      } else {
        toast.error("Something went wrong while accepting RFQ");
      }
    },
  });

  return (
    <Dialog>
      <DialogTrigger disabled={data.status != "P"}>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
          disabled={data.status != "P"}
        >
          <X className="w-4 h-4" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Quote</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this quote for RFQ ID: {data.id}?
          </DialogDescription>
        </DialogHeader>

        <SelectField
          label="Role"
          placeholder="Select deal type"
          required
          options={[
            {
              label: "I = If initiator of the RFQ",
              value: "I",
            },
            {
              label: "R = if responder to the RFQ",
              value: "R",
            },
          ]}
          value={role}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChangeAction={(e) => setRole(e as any)}
        />

        <DialogFooter>
          <DialogTrigger>
            <Button variant="secondary">Cancel</Button>
          </DialogTrigger>
          <Button
            onClick={() => rejectQuoteMutation.mutate()}
            disabled={rejectQuoteMutation.isPending}
          >
            Reject Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RejectQuate;
