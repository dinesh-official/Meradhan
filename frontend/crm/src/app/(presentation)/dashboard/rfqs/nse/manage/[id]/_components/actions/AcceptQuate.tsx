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
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import LabelView from "@/global/elements/wrapper/LabelView";
import apiGateway, { ApiError, CreateRfqResponseItem } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
import {
  DealTypeBadge,
  TradeTypeBadge,
  YieldTypeBadge,
} from "../../../../_components/bages/NseRfqBadges";
import { SelectNseParticipant } from "@/global/elements/autocomplete/SelectNseParticipant";
import { queryClient } from "@/core/config/reactQuery";
function AcceptQuate({ data }: { data: CreateRfqResponseItem }) {
  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);
  const router = useRouter();
  const [openClientCOde, setOpenClientCOde] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clientCode, setClientCode] = useState<undefined | any>();
  const [dealType, setDealType] = useState<"B" | "D">("B");

  const acceptQuoteMutation = useMutation({
    mutationKey: ["acceptQuote", data.id],
    mutationFn: async () => {
      // Replace with actual API call to accept the quote
      return await rfqApi.acceptQuoteNegotiation({
        rfqNumber: data.number,
        acceptedValue: data.value,
        respDealType: dealType,
        respClientCode: clientCode || undefined,
      });
    },
    onSuccess: () => {
      // Handle success (e.g., show a success message, refresh data)
      toast.success("Quote accepted successfully");
      queryClient.invalidateQueries({
        queryKey: ["find-rfq"],
      });
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
          variant="default"
          size="sm"
          className="flex items-center gap-2"
          disabled={data.status != "P"}
        >
          <Check className="w-4 h-4" />
          Accept
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Quote</DialogTitle>
          <DialogDescription>
            Are you sure you want to accept this quote for RFQ ID: {data.id}?
          </DialogDescription>
        </DialogHeader>

        <div className="gap-5 grid grid-cols-3">
          <LabelView title="RFQ Number">{data.number}</LabelView>
          <LabelView title="ISIN">{data.isin}</LabelView>
          <LabelView title="Participant Code">{data.participantCode}</LabelView>
          <LabelView title="Client Code">{data.clientCode}</LabelView>
          <LabelView title="Deal Type">
            <DealTypeBadge type={`${data.dealType}`} />
          </LabelView>
          <LabelView title="Settlement Date">{data.settlementDate}</LabelView>
          <LabelView title="Value">{data.value}</LabelView>
          <LabelView title="Yield">{data.yield}</LabelView>
          <LabelView title="Yield Type">
            <YieldTypeBadge type={`${data.yieldType}`} />
          </LabelView>
          <LabelView title="Price">{data.price || "--"}</LabelView>
          <LabelView title="Buy/Sell">
            <TradeTypeBadge type={`${data.buySell}`} />
          </LabelView>
          <LabelView title="End Time">{data.endTime}</LabelView>
          <div className="gap-5 grid grid-cols-2 col-span-3">
            <SelectField
              label="Deal Type"
              placeholder="Select deal type"
              required
              options={[
                {
                  label: "Direct",
                  value: "D",
                },
                {
                  label: "Brokered",
                  value: "B",
                },
              ]}
              value={dealType}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChangeAction={(e) => setDealType(e as any)}
            />
            <div className="relative">
              <InputField
                id="clientcode"
                label="Client Code"
                required
                placeholder="Enter Client Code"
                value={clientCode}
                onChangeAction={(e) => {
                  if (e.length == 0) {
                    setClientCode(undefined);
                  } else {
                    setClientCode(e);
                  }
                }}
              />
              <Plus
                className="absolute right-2 top-7.5 cursor-pointer"
                size={18}
                onClick={() => setOpenClientCOde(true)}
              />
            </div>
          </div>
        </div>
        <SelectNseParticipant
          open={openClientCOde}
          setOpen={setOpenClientCOde}
          onSelect={(e) => {
            setClientCode(e?.loginId);
          }}
        />
        <DialogFooter>
          <DialogTrigger>
            <Button variant="secondary">Cancel</Button>
          </DialogTrigger>
          <Button
            onClick={() => acceptQuoteMutation.mutate()}
            disabled={acceptQuoteMutation.isPending}
          >
            Accept Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AcceptQuate;
