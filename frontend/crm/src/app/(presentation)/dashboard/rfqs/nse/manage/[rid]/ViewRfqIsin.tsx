import React from "react";
import {
  NseRfqSegmentBadge,
  DealTypeBadge,
  TradeTypeBadge,
  PriceYieldTypeBadge,
  YieldTypeBadge,
  RfqAccessBadge,
  AnonymousRfqBadge,
  SettlementTypeBadge,
  RfqStatusBadge,
} from "../../_components/bages/NseRfqBadges"; // 👈 Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const rfqData = {
  id: 1,
  number: "R25110600000005",
  segment: "R",
  isin: "INE002L08010",
  participantCode: "BCISPL",
  dealType: "B",
  clientCode: "MD123456",
  clientRegType: "R",
  buySell: "B",
  quoteType: "Y",
  settlementType: 1,
  value: 0.2,
  quantity: 2,
  yieldType: "YTM",
  yield: 7.1,
  calcMethod: "O",
  price: null,
  gtdFlag: "Y",
  endTime: "23:50",
  access: 2,
  participantList: ["BCISPL"],
  date: "06-Nov-2025",
  quoteTime: "11:38:07",
  settlementDate: "07-Nov-2025",
  status: "P",
  userLogin: "DEV",
  tradedValue: 0,
  confirmedValue: 0,
};

function ViewRfqIsin() {
  return (
    <div className="mx-auto p-6 max-w-4xl">
      <Card className="shadow-sm border rounded-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center font-semibold text-lg">
            <span>RFQ Details</span>
            <RfqStatusBadge status={rfqData.status} />
          </CardTitle>
        </CardHeader>
        <Separator />

        <CardContent className="space-y-6 mt-4">
          {/* RFQ Header Info */}
          <div className="gap-4 grid md:grid-cols-2 text-sm">
            <div>
              <p className="text-gray-500">RFQ Number</p>
              <p className="font-medium">{rfqData.number}</p>
            </div>
            <div>
              <p className="text-gray-500">ISIN</p>
              <p className="font-medium">{rfqData.isin}</p>
            </div>
            <div>
              <p className="text-gray-500">Participant Code</p>
              <p className="font-medium">{rfqData.participantCode}</p>
            </div>
            <div>
              <p className="text-gray-500">Client Code</p>
              <p className="font-medium">{rfqData.clientCode}</p>
            </div>
          </div>

          <Separator />

          {/* Badge Section */}
          <div className="flex flex-wrap gap-2">
            <NseRfqSegmentBadge type={rfqData.segment} />
            <DealTypeBadge type={rfqData.dealType} />
            <TradeTypeBadge type={rfqData.buySell} />
            <PriceYieldTypeBadge type={rfqData.quoteType} />
            <YieldTypeBadge type={rfqData.yieldType} buySell={rfqData.buySell} />
            <SettlementTypeBadge type={rfqData.settlementType} />
            <RfqAccessBadge type={rfqData.access} />
            <AnonymousRfqBadge flag={rfqData.access} />
          </div>

          <Separator />

          {/* Trade Details */}
          <div className="gap-4 grid md:grid-cols-3 text-sm">
            <div>
              <p className="text-gray-500">Value</p>
              <p className="font-medium">{rfqData.value ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium">{rfqData.quantity ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Yield</p>
              <p className="font-medium">{rfqData.yield ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Calc Method</p>
              <p className="font-medium">{rfqData.calcMethod ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">GTD Flag</p>
              <p className="font-medium">{rfqData.gtdFlag ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">End Time</p>
              <p className="font-medium">{rfqData.endTime}</p>
            </div>
          </div>

          <Separator />

          {/* Settlement & Status */}
          <div className="gap-4 grid md:grid-cols-3 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{rfqData.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Quote Time</p>
              <p className="font-medium">{rfqData.quoteTime}</p>
            </div>
            <div>
              <p className="text-gray-500">Settlement Date</p>
              <p className="font-medium">{rfqData.settlementDate}</p>
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="flex justify-between pt-2 text-gray-600 text-sm">
            <p>
              <span className="font-medium">Created By:</span> {rfqData.userLogin}
            </p>
            <p>
              <span className="font-medium">Traded Value:</span> {rfqData.tradedValue}
            </p>
            <p>
              <span className="font-medium">Confirmed Value:</span>{" "}
              {rfqData.confirmedValue}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ViewRfqIsin;
