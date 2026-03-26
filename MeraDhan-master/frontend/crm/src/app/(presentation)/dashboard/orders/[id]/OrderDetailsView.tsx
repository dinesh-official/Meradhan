"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { decodeId } from "@/global/utils/url.utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart,
  CreditCard,
  ArrowRight,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";

// Helper functions to safely extract values from Record<string, unknown>
const getBondDetail = (
  bondDetails: Record<string, unknown>,
  key: string
): unknown => {
  return bondDetails[key];
};

const hasBondDetail = (
  bondDetails: Record<string, unknown>,
  key: string
): boolean => {
  const value = bondDetails[key];
  return value !== null && value !== undefined;
};

const getBondDetailString = (
  bondDetails: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  return String(value);
};

const getBondDetailNumber = (
  bondDetails: Record<string, unknown>,
  key: string
): number | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

function OrderDetailsView() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = decodeId(params.id as string);

  const apiCaller = new apiGateway.crm.crmOrdersApi(apiClientCaller);

  const { data, isLoading, error } = useQuery({
    queryKey: ["crm-order", orderId],
    queryFn: () => apiCaller.getOrderById(orderId),
    enabled: !!orderId && orderId > 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED") =>
      apiCaller.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["crm-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["crmOrders"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to update order status";
      toast.error(errorMessage);
    },
  });

  const order = data?.responseData;

  const handleStatusChange = (newStatus: string) => {
    if (
      newStatus === "PENDING" ||
      newStatus === "SETTLED" ||
      newStatus === "APPLIED" ||
      newStatus === "REJECTED"
    ) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">
          {error ? "Failed to load order details" : "Order not found"}
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground mt-1">
            Order Number: {order.orderNumber}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge value={order.status} />
          <Badge variant="outline">{order.paymentStatus}</Badge>
        </div>
      </div>

      {/* Status Update Section - Admin Only */}
      <AllowOnlyView permissions={['edit:orders']} >
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Update Status:
          </span>
          <Select
            value={order.status}
            onValueChange={handleStatusChange}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="SETTLED">SETTLED</SelectItem>
              <SelectItem value="APPLIED">APPLIED</SelectItem>
              <SelectItem value="REJECTED">REJECTED</SelectItem>
            </SelectContent>
          </Select>
          {updateStatusMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>

      </AllowOnlyView>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {order.customerProfile.firstName}{" "}
                    {order.customerProfile.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {order.customerProfile.emailAddress}
                  </p>
                </div>
                {order.customerProfile.phoneNo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {order.customerProfile.phoneNo}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="font-medium">{order.customerProfile.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bond Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bond Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bond Name</p>
                  <p className="font-medium">{order.bondName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISIN</p>
                  <p className="font-medium">{order.isin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Face Value</p>
                  <p className="font-medium">
                    ₹{parseFloat(order.faceValue).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit Price</p>
                  <p className="font-medium">
                    ₹{parseFloat(order.unitPrice).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              {order.bondDetails && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">
                    Additional Bond Details
                  </h3>
                  <div className="space-y-6">
                    {/* Financial Information */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Financial Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {hasBondDetail(order.bondDetails, "couponRate") && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Coupon Rate
                            </p>
                            <p className="font-medium">
                              {getBondDetailString(
                                order.bondDetails,
                                "couponRate"
                              )}
                              %
                            </p>
                          </div>
                        )}
                        {hasBondDetail(order.bondDetails, "issuePrice") && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Issue Price
                            </p>
                            <p className="font-medium">
                              ₹
                              {getBondDetailNumber(
                                order.bondDetails,
                                "issuePrice"
                              )?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        )}
                        {hasBondDetail(order.bondDetails, "totalIssueSize") && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Issue Size
                            </p>
                            <p className="font-medium">
                              ₹
                              {getBondDetailNumber(
                                order.bondDetails,
                                "totalIssueSize"
                              )?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    {(hasBondDetail(order.bondDetails, "maturityDate") ||
                      hasBondDetail(order.bondDetails, "redemptionDate") ||
                      hasBondDetail(order.bondDetails, "dateOfAllotment")) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Important Dates
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {getBondDetailString(
                              order.bondDetails,
                              "maturityDate"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Maturity Date
                                  </p>
                                  <p className="font-medium">
                                    {dateTimeUtils.formatDateTime(
                                      getBondDetailString(
                                        order.bondDetails,
                                        "maturityDate"
                                      )!,
                                      "DD MMM YYYY"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "redemptionDate"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Redemption Date
                                  </p>
                                  <p className="font-medium">
                                    {dateTimeUtils.formatDateTime(
                                      getBondDetailString(
                                        order.bondDetails,
                                        "redemptionDate"
                                      )!,
                                      "DD MMM YYYY"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "dateOfAllotment"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Date of Allotment
                                  </p>
                                  <p className="font-medium">
                                    {dateTimeUtils.formatDateTime(
                                      getBondDetailString(
                                        order.bondDetails,
                                        "dateOfAllotment"
                                      )!,
                                      "DD MMM YYYY"
                                    )}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Rating & Status */}
                    {(hasBondDetail(order.bondDetails, "creditRating") ||
                      hasBondDetail(order.bondDetails, "taxStatus") ||
                      hasBondDetail(order.bondDetails, "isListed")) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Rating & Status
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {getBondDetailString(
                              order.bondDetails,
                              "creditRating"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Credit Rating
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "creditRating"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "taxStatus"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Tax Status
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "taxStatus"
                                    )}
                                  </p>
                                </div>
                              )}
                            {hasBondDetail(order.bondDetails, "isListed") && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Listing Status
                                </p>
                                <Badge variant="outline">
                                  {getBondDetailString(
                                    order.bondDetails,
                                    "isListed"
                                  )}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {getBondDetailString(
                            order.bondDetails,
                            "creditRatingInfo"
                          ) && (
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground">
                                  Credit Rating Info
                                </p>
                                <p className="font-medium text-sm">
                                  {getBondDetailString(
                                    order.bondDetails,
                                    "creditRatingInfo"
                                  )}
                                </p>
                              </div>
                            )}
                          {getBondDetailString(
                            order.bondDetails,
                            "ratingAgencyName"
                          ) && (
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground">
                                  Rating Agency
                                </p>
                                <p className="font-medium">
                                  {getBondDetailString(
                                    order.bondDetails,
                                    "ratingAgencyName"
                                  )}
                                </p>
                              </div>
                            )}
                        </div>
                      )}

                    {/* Payment & Interest Details */}
                    {(hasBondDetail(order.bondDetails, "interestPaymentMode") ||
                      hasBondDetail(
                        order.bondDetails,
                        "interestPaymentFrequency"
                      )) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Payment & Interest
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {getBondDetailString(
                              order.bondDetails,
                              "interestPaymentMode"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Interest Payment Mode
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "interestPaymentMode"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "interestPaymentFrequency"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Payment Frequency
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "interestPaymentFrequency"
                                    )}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Additional Information */}
                    {(hasBondDetail(order.bondDetails, "description") ||
                      hasBondDetail(order.bondDetails, "instrumentName") ||
                      hasBondDetail(order.bondDetails, "sectorName") ||
                      hasBondDetail(order.bondDetails, "categories")) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Additional Information
                          </h4>
                          <div className="space-y-3">
                            {getBondDetailString(
                              order.bondDetails,
                              "description"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Description
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "description"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "instrumentName"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Instrument Name
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "instrumentName"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "sectorName"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Sector
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "sectorName"
                                    )}
                                  </p>
                                </div>
                              )}
                            {Array.isArray(
                              getBondDetail(order.bondDetails, "categories")
                            ) &&
                              (
                                getBondDetail(
                                  order.bondDetails,
                                  "categories"
                                ) as unknown[]
                              ).length > 0 && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Categories
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {(
                                      getBondDetail(
                                        order.bondDetails,
                                        "categories"
                                      ) as unknown[]
                                    ).map((cat: unknown, idx: number) => (
                                      <Badge key={idx} variant="secondary">
                                        {String(cat)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Registrar & Trustee Details */}
                    {(hasBondDetail(order.bondDetails, "registrarDetails") ||
                      hasBondDetail(order.bondDetails, "debentureTrustee") ||
                      hasBondDetail(
                        order.bondDetails,
                        "certificateNumbers"
                      )) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Registrar & Trustee
                          </h4>
                          <div className="space-y-3">
                            {getBondDetailString(
                              order.bondDetails,
                              "registrarDetails"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Registrar Details
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "registrarDetails"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "debentureTrustee"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Debenture Trustee
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "debentureTrustee"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "certificateNumbers"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Certificate Numbers
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "certificateNumbers"
                                    )}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Options & Other Details */}
                    {(hasBondDetail(
                      order.bondDetails,
                      "putCallOptionDetails"
                    ) ||
                      hasBondDetail(
                        order.bondDetails,
                        "physicalSecurityAddress"
                      ) ||
                      hasBondDetail(
                        order.bondDetails,
                        "defaultedInRedemption"
                      ) ||
                      hasBondDetail(order.bondDetails, "remarks")) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Options & Other Details
                          </h4>
                          <div className="space-y-3">
                            {(() => {
                              const value = getBondDetailString(
                                order.bondDetails,
                                "putCallOptionDetails"
                              );
                              return value && value.trim() ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Put/Call Option Details
                                  </p>
                                  <p className="font-medium text-sm">{value}</p>
                                </div>
                              ) : null;
                            })()}
                            {(() => {
                              const value = getBondDetailString(
                                order.bondDetails,
                                "physicalSecurityAddress"
                              );
                              return value && value.trim() ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Physical Security Address
                                  </p>
                                  <p className="font-medium text-sm">{value}</p>
                                </div>
                              ) : null;
                            })()}
                            {(() => {
                              const value = getBondDetailString(
                                order.bondDetails,
                                "defaultedInRedemption"
                              );
                              return value && value.trim() ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Defaulted in Redemption
                                  </p>
                                  <p className="font-medium text-sm">{value}</p>
                                </div>
                              ) : null;
                            })()}
                            {(() => {
                              const value = getBondDetailString(
                                order.bondDetails,
                                "remarks"
                              );
                              return value && value.trim() ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Remarks
                                  </p>
                                  <p className="font-medium text-sm">{value}</p>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {order.paymentProvider && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Provider
                    </p>
                    <p className="font-medium">{order.paymentProvider}</p>
                  </div>
                )}
                {order.paymentOrderId && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Order ID
                    </p>
                    <p className="font-medium font-mono text-sm">
                      {order.paymentOrderId}
                    </p>
                  </div>
                )}
                {order.paymentId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-medium font-mono text-sm">
                      {order.paymentId}
                    </p>
                  </div>
                )}
              </div>
              {order.paymentMetadata && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Payment Metadata
                  </p>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                    {JSON.stringify(order.paymentMetadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Order Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {order.orderLogs && order.orderLogs.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-6">
                    {order.orderLogs.map((log) => {
                      const getStepIcon = () => {
                        const step = log.step.toUpperCase();
                        if (step.includes("PAYMENT")) {
                          return <CreditCard className="h-4 w-4" />;
                        }
                        if (
                          step.includes("ORDER_CREATED") ||
                          step.includes("CREATED")
                        ) {
                          return <ShoppingCart className="h-4 w-4" />;
                        }
                        if (step.includes("STEP")) {
                          return <ArrowRight className="h-4 w-4" />;
                        }
                        return <FileText className="h-4 w-4" />;
                      };

                      const getStatusIcon = () => {
                        if (log.status === "SUCCESS") {
                          return (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          );
                        }
                        if (log.status === "FAILED") {
                          return <XCircle className="h-5 w-5 text-red-600" />;
                        }
                        return <Clock className="h-5 w-5 text-yellow-600" />;
                      };

                      const formatStepName = (step: string) => {
                        // Handle common step patterns
                        const stepUpper = step.toUpperCase();

                        // Step changed patterns
                        if (stepUpper.includes("STEP_CHANGED")) {
                          const stepName = stepUpper
                            .replace("STEP_CHANGED_", "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ");
                          return `Moved to: ${stepName}`;
                        }

                        // Payment related
                        if (stepUpper === "PAYMENT_SUCCESS") {
                          return "Payment Successful";
                        }
                        if (stepUpper === "PAYMENT_FAILED") {
                          return "Payment Failed";
                        }
                        if (stepUpper === "PAYMENT_ATTEMPTED") {
                          return "Payment Attempted";
                        }

                        // Order related
                        if (stepUpper === "ORDER_CREATED") {
                          return "Order Created";
                        }

                        // Page view
                        if (stepUpper === "PAGE_VIEW") {
                          return "Page Viewed";
                        }

                        // Quantity and settlement
                        if (stepUpper === "QUANTITY_CHANGED") {
                          return "Quantity Changed";
                        }
                        if (stepUpper === "SETTLEMENT_DATE_CHANGED") {
                          return "Settlement Date Changed";
                        }

                        // Checkbox interactions
                        if (stepUpper.includes("CHECKBOX_")) {
                          const checkboxName = stepUpper
                            .replace("CHECKBOX_", "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ");
                          return `Agreement: ${checkboxName}`;
                        }

                        // Error patterns
                        if (stepUpper.startsWith("ERROR_")) {
                          const errorType = stepUpper
                            .replace("ERROR_", "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ");
                          return `Error: ${errorType}`;
                        }

                        // Default: convert snake_case to Title Case
                        return step
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ");
                      };

                      const hasData = log.outputData || log.details;

                      return (
                        <div key={log.id} className="relative pl-14">
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-primary">
                            {getStatusIcon()}
                          </div>

                          <div className="space-y-2">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center gap-2 text-primary">
                                    {getStepIcon()}
                                    <span className="font-semibold text-sm">
                                      {formatStepName(log.step)}
                                    </span>
                                  </div>
                                  <StatusBadge value={log.status} />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {dateTimeUtils.formatDateTime(
                                    log.createdAt,
                                    "DD MMM YYYY hh:mm AA"
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Data sections */}
                            {hasData && (
                              <Collapsible>
                                <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                                  <span>View details</span>
                                  <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 space-y-3">
                                  {log.outputData && (
                                    <div className="bg-muted/50 p-3 rounded-md">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Output Data
                                      </p>
                                      <div className="space-y-1.5">
                                        {Object.entries(log.outputData).map(
                                          ([key, value]) => (
                                            <div
                                              key={key}
                                              className="flex items-start gap-2 text-xs"
                                            >
                                              <span className="text-muted-foreground min-w-[100px] capitalize">
                                                {key
                                                  .replace(/([A-Z])/g, " $1")
                                                  .trim()}
                                                :
                                              </span>
                                              <span className="font-medium text-foreground break-all">
                                                {String(value)}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {log.details && (
                                    <div className="bg-muted/50 p-3 rounded-md">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Details
                                      </p>
                                      <div className="space-y-1.5">
                                        {Object.entries(log.details).map(
                                          ([key, value]) => {
                                            // Format special fields
                                            if (key === "timestamp") {
                                              return (
                                                <div
                                                  key={key}
                                                  className="flex items-start gap-2 text-xs"
                                                >
                                                  <span className="text-muted-foreground min-w-[100px] capitalize">
                                                    {key}:
                                                  </span>
                                                  <span className="font-medium text-foreground">
                                                    {dateTimeUtils.formatDateTime(
                                                      String(value),
                                                      "DD MMM YYYY hh:mm AA"
                                                    )}
                                                  </span>
                                                </div>
                                              );
                                            }
                                            if (
                                              typeof value === "object" &&
                                              value !== null
                                            ) {
                                              return (
                                                <div
                                                  key={key}
                                                  className="flex items-start gap-2 text-xs"
                                                >
                                                  <span className="text-muted-foreground min-w-[100px] capitalize">
                                                    {key
                                                      .replace(
                                                        /([A-Z])/g,
                                                        " $1"
                                                      )
                                                      .trim()}
                                                    :
                                                  </span>
                                                  <pre className="text-xs bg-background p-2 rounded border flex-1 overflow-auto">
                                                    {JSON.stringify(
                                                      value,
                                                      null,
                                                      2
                                                    )}
                                                  </pre>
                                                </div>
                                              );
                                            }
                                            return (
                                              <div
                                                key={key}
                                                className="flex items-start gap-2 text-xs"
                                              >
                                                <span className="text-muted-foreground min-w-[100px] capitalize">
                                                  {key
                                                    .replace(/([A-Z])/g, " $1")
                                                    .trim()}
                                                  :
                                                </span>
                                                <span className="font-medium text-foreground break-all">
                                                  {String(value)}
                                                </span>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No logs available for this order
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Financial Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  ₹{parseFloat(order.subTotal).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stamp Duty</span>
                <span className="font-medium">
                  ₹{parseFloat(order.stampDuty).toLocaleString("en-IN")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>
                  ₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {dateTimeUtils.formatDateTime(
                    order.createdAt,
                    "DD MMM YYYY hh:mm AA"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {dateTimeUtils.formatDateTime(
                    order.updatedAt,
                    "DD MMM YYYY hh:mm AA"
                  )}
                </p>
              </div>
              {order.metadata && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                    {JSON.stringify(order.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Bonds (if exists) */}
          {order.customerBonds && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Bond Record</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">
                    {dateTimeUtils.formatDateTime(
                      order.customerBonds.purchaseDate,
                      "DD MMM YYYY hh:mm AA"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Purchase Price
                  </p>
                  <p className="font-medium">
                    ₹
                    {parseFloat(
                      order.customerBonds.purchasePrice
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsView;
