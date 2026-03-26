"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { Button } from "@/components/ui/button";
import { Pencil, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import LeadStatusBadge from "@/global/elements/wrapper/badges/LeadStatusBadge";
import PartnershipFollowUpNotes from "../_components/followUpNotes/PartnershipFollowUpNotes";
import { usePartnershipFollowUpNoteFormHook } from "../_components/followUpNotes/hooks/usePartnershipFollowUpFormDataHook";
import { useState } from "react";
import { encodeId } from "@/global/utils/url.utils";
import { Route } from "next";

const PartnershipDetailsView = ({ id }: { id: number }) => {
  const router = useRouter();
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const followUpManager = usePartnershipFollowUpNoteFormHook(id);

  const fetchPartnership = async () => {
    const partnershipApi =
      new apiGateway.crm.crmPartnership.CrmPartnershipApi(apiClientCaller);
    const { data } = await partnershipApi.getPartnershipById(id);
    return data.responseData;
  };

  const { data: partnership, isLoading } = useQuery({
    queryKey: ["fetchPartnership", id],
    queryFn: fetchPartnership,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!partnership) {
    return <div>Partnership not found</div>;
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => setFollowUpOpen(true)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Follow-Up Notes
        </Button>
        <Button
          onClick={() => {
            router.push(
              `/dashboard/leads/partnerships/${encodeId(id)}/update` as Route
            );
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Organization Name</p>
              <p className="font-medium">{partnership.organizationName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Organization Type
              </p>
              <p className="font-medium">{partnership.organizationType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="font-medium">{partnership.city}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-medium">{partnership.state}</p>
            </div>
            {partnership.website && (
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <a
                  href={partnership.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {partnership.website}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Person Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{partnership.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">{partnership.designation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{partnership.emailAddress}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile Number</p>
              <p className="font-medium">{partnership.mobileNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partnership Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Partnership Model</p>
              <p className="font-medium capitalize">
                {partnership.partnershipModel?.replace("-", " / ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <LeadStatusBadge value={partnership.status} />
            </div>
            {partnership.clientBase && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Client Base / AUM
                </p>
                <p className="font-medium">{partnership.clientBase}</p>
              </div>
            )}
            {partnership.assignTo && (
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="font-medium">{partnership.assignTo.name}</p>
              </div>
            )}
          </div>
          {partnership.message && (
            <div>
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="font-medium whitespace-pre-wrap">
                {partnership.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {dateTimeUtils.formatDateTime(
                  partnership.createdAt,
                  "DD MMMM YYYY hh:mm AA"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated At</p>
              <p className="font-medium">
                {dateTimeUtils.formatDateTime(
                  partnership.updatedAt,
                  "DD MMMM YYYY hh:mm AA"
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PartnershipFollowUpNotes
        manager={followUpManager}
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        partnershipId={id}
      />
    </div>
  );
};

export default PartnershipDetailsView;

