"use client";
import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BondInfoLabel } from "@/global/components/Bond/BondInfoLabel";
import { dateTimeUtils, formatDateCustom } from "@/global/utils/datetime.utils";
import { formatCleanPricePercent, formatNumberTS } from "@/global/utils/formate";
import {
  BondDetailsResponse,
  BondOrderPricingData,
  CustomerByIdPayload,
} from "@root/apiGateway";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import { PiCurrencyInrBold } from "react-icons/pi";
import { getPlaceOrderBusinessDates } from "../../_utils/businessDates";
import { getMaxOrderQuantityFromBond } from "../../_utils/quantity";
import { hasCrmInventoryAvailable } from "@/global/utils/bondPurchaseEligibility";
import { useOrderState } from "../../store/useOrderState";
import BondInfoData from "../BondInfoData";
import { RatingOrDelete } from "../RatingOrDelete";
import { useState, useRef, useEffect, useMemo } from "react";
import { useOrderActivityTracking } from "../../_hooks/useOrderActivityTracking";
import { parseAsInteger, useQueryState } from "nuqs";
import { useSearchParams } from "next/navigation";

const WEEKEND_ONLY_HOLIDAYS = new Set<string>();
function ReviewOrder({
  bond,
  customer,
  orderId,
  orderPricing,
  isPricingFetching = false,
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
  orderPricing: BondOrderPricingData | null;
  isPricingFetching?: boolean;
}) {
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedRisk, setIsCheckedRisk] = useState(false);
  // set search params
  const params = useSearchParams();
  const searchParams = params.get('allowTrade')
  const allowTrade = searchParams === 'true'
  const [paramsQuantity, setParamsQuantity] = useQueryState('quantity', parseAsInteger.withDefault(1))


  const {
    quantity,
    setQuantity,
    settlementDate,
    setSettlementDate,
    setStep,
    step,
  } = useOrderState();

  useEffect(() => {
    setQuantity(paramsQuantity);
  }, [paramsQuantity, setQuantity]);

  const maxOrderQuantity = useMemo(() => getMaxOrderQuantityFromBond(bond), [bond]);
  const outOfStock = !hasCrmInventoryAvailable(bond);

  const suppressQuantityReloadRef = useRef(false);
  useEffect(() => {
    if (maxOrderQuantity < 1) return;
    const clamped = Math.min(maxOrderQuantity, Math.max(1, paramsQuantity));
    if (clamped !== paramsQuantity) {
      suppressQuantityReloadRef.current = true;
      void setParamsQuantity(clamped);
    }
  }, [maxOrderQuantity, paramsQuantity, setParamsQuantity]);

  const {
    trackQuantityChange,
    trackCheckboxInteraction,
    trackButtonClick,
  } = useOrderActivityTracking();

  const previousQuantity = useRef(quantity);
  const { dealDate, settlementDate: computedSettlementDate } = useMemo(
    () => getPlaceOrderBusinessDates(WEEKEND_ONLY_HOLIDAYS, "1"),
    []
  );

  // Track quantity changes
  useEffect(() => {
    if (previousQuantity.current !== quantity) {
      trackQuantityChange(orderId, previousQuantity.current, quantity);
      previousQuantity.current = quantity;
    }
  }, [quantity, orderId, trackQuantityChange]);

  const demateAccount = customer.dematAccounts.find(
    (account) => account.isPrimary
  );

  const bankAccount = customer.bankAccounts.find(
    (account) => account.isPrimary
  );
  const indicativeYield = orderPricing?.yield;

  const principalScaled = orderPricing?.principalAmount
  const accruedScaled = orderPricing?.accruedInterest || 0;
  const stampScaled = orderPricing?.stampDuty ?? 0;
  const settlementAmount = orderPricing?.settlementAmount ?? 0
  const totalConsideration =
    orderPricing?.totalConsideration ??
    ((principalScaled ?? 0) + (accruedScaled ?? 0));

  return (
    <div className="container">
      <h1 className="title">Review & Confirm Order</h1>
      <div className="flex mt-5">
        <div className="flex items-center md:justify-start justify-between w-full gap-4">
          {/* <div className="border-2 items-center flex justify-center bg-white min-h-16 px-4 py-5.5  rounded-md border-gray-200">
            <img
              src="https://media.licdn.com/dms/image/v2/D5616AQHCSw6TFvHuWg/profile-displaybackgroundimage-shrink_200_800/profile-displaybackgroundimage-shrink_200_800/0/1712728211011?e=2147483647&v=beta&t=U-lbDGIHBKOPGjuB5Om5qHUUJc_RqyTypV4PW_dq6dM"
              alt="logo"
              className="w-24 rounded-md "
            />
          </div> */}
          <div className="md:block hidden">
            <BondInfoData bondData={bond} />
          </div>
          <RatingOrDelete rating={bond.creditRating} />
        </div>
      </div>
      <div className="md:hidden mt-5">
        <BondInfoData bondData={bond} />
      </div>
      {outOfStock && (
        <div
          className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-semibold">Bond out of stock</p>
          <p className="mt-1 text-destructive/90">
            There is no sellable inventory for this bond. You cannot proceed with this order.
          </p>
        </div>
      )}
      {!orderPricing && !outOfStock && (
        <div
          className="mt-5 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"
          role="alert"
        >
          <p className="font-semibold">Pricing unavailable</p>
          <p className="mt-1">
            Settlement amounts could not be loaded from DeriData. Change quantity or refresh
            the page to retry.
          </p>
        </div>
      )}
      <div className="mt-5 border-t md:border md:p-8 pt-5 border-gray-200 md:rounded-[10px]">
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2  md:gap-y-10 gap-y-5 gap-x-6">
          <BondInfoLabel title="Yield to Maturity">
            <p className="text-black">
              {indicativeYield != null && Number.isFinite(Number(indicativeYield))
                ? `${Number(indicativeYield).toFixed(2)}%`
                : "—"}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Coupon Rate / Frequency">
            <p className="text-black">
              {Number(bond.couponRate).toFixed(2)}%
              {bond.interestPaymentFrequency
                ? ` / ${bond.interestPaymentFrequency.replaceAll("_", " ")}`
                : ""}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Face Value">
            <p className="text-black flex items-center gap-1">
              <PiCurrencyInrBold aria-hidden="true" /> {formatNumberTS(bond.faceValue)}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Maturity Date">
            <p className="text-black flex items-center gap-1">
              {formatDateCustom(bond.maturityDate)}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Issue Price">
            <p className="text-black flex items-center gap-1">
              <PiCurrencyInrBold aria-hidden="true" /> {formatNumberTS(bond.issuePrice)}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Deal Date (Trade Date)">
            <p className="text-black flex items-center gap-1">
              {orderPricing
                ? `${formatDateCustom(orderPricing.dealDate)} (${orderPricing.dealDay})`
                : dateTimeUtils.formatDateTime(dealDate, "DD MMMM YYYY")}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Settlement Date">
            {orderPricing ? (
              <p className="text-black">
                {formatDateCustom(orderPricing.settlementDate)} (
                {orderPricing.settlementDay}) · {orderPricing.settlementOrder}
              </p>
            ) : (
              <Select value={settlementDate} onValueChange={setSettlementDate}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={`${dateTimeUtils.formatDateTime(computedSettlementDate, "DD MMMM YYYY")} (T + 1)`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    {dateTimeUtils.formatDateTime(computedSettlementDate, "DD MMMM YYYY")}{" "}
                    (T + 1)
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </BondInfoLabel>




          <BondInfoLabel
            title={`Quantity of Bonds (max. ${maxOrderQuantity} available)`}
          >
            <div className="flex items-center w-full border border-[#E1E6E8] rounded-md ">
              <Button
                className="bg-[#E1E6E8] text-black font-semibold  text-lg  rounded-r-none"
                onClick={() => {
                  trackButtonClick(orderId, "QUANTITY_DECREASE", {
                    previousQuantity: quantity,
                    newQuantity: quantity - 1,
                  });
                  setParamsQuantity(Math.max(1, quantity - 1));
                }}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <input
                type="number"
                className="quantity-input w-full text-center border-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={quantity}
                min={1}
                max={maxOrderQuantity}
                onChange={(e) =>
                  setParamsQuantity(
                    Math.min(maxOrderQuantity, Math.max(1, Number(e.target.value) || 1))
                  )
                }
              />
              <Button
                className="bg-[#E1E6E8] text-black  text-lg font-semibold rounded-l-none"
                onClick={() => {
                  trackButtonClick(orderId, "QUANTITY_INCREASE", {
                    previousQuantity: quantity,
                    newQuantity: quantity + 1,
                  });
                  setParamsQuantity(Math.min(maxOrderQuantity, quantity + 1));
                }}
                disabled={quantity >= maxOrderQuantity}
              >
                +
              </Button>
            </div>
          </BondInfoLabel>
        </div>

        <p className="font-semibold mt-4">Demat Account Details</p>
        <div className="grid md:grid-cols-4 grid-cols-2 mt-4 gap-5">
          {demateAccount?.depositoryName == "NSDL" && (
            <DataInfoLabel
              title="DP ID"
              status="SUCCESS"
              statusLabel="Verified"
              showStatus
            >
              <p className="flex items-center gap-2 text-black ">
                {demateAccount?.dpId}
              </p>
            </DataInfoLabel>
          )}
          <DataInfoLabel
            title="Ben. / Client ID"
            status="SUCCESS"
            statusLabel="Verified"
            showStatus
          >
            <p className="flex items-center gap-2 text-black ">
              {demateAccount?.clientId}
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="Depository">
            <p className="flex items-center gap-2 text-black ">
              {demateAccount?.depositoryName}
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="Demat Account Type">
            <p className="flex items-center gap-2 text-black ">
              {demateAccount?.accountType}
            </p>
          </DataInfoLabel>
        </div>

        <p className="font-semibold mt-4">Bank Account Details</p>
        <div className="grid md:grid-cols-4 grid-cols-2 mt-4 gap-5">
          <DataInfoLabel
            title="IFSC Code"
            status="SUCCESS"
            statusLabel="Verified"
            showStatus
          >
            <p className="flex items-center gap-2 text-black ">
              {bankAccount?.ifscCode}
            </p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Account Number"
            status="SUCCESS"
            statusLabel="Verified"
            showStatus
          >
            <p className="flex items-center gap-2 text-black ">
              {bankAccount?.accountNumber}
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="Bank Name">
            <p className="flex items-center gap-2 text-black ">
              {bankAccount?.bankName}
            </p>
          </DataInfoLabel>
        </div>

        <div className="md:grid md:grid-cols-2 flex justify-between  gap-5 border-t pt-6 mt-6 border-gray-200">
          <div>
            <p className="text-lg text-black">Settlement Amount</p>
            {!orderPricing && (
              <p className="text-sm">(Pricing unavailable)</p>
            )}
          </div>
          <div>
            <p className="text-lg text-black flex items-center gap-1 font-medium">
              <PiCurrencyInrBold aria-hidden="true" />{" "}
              {isPricingFetching ? "…" : formatNumberTS(settlementAmount)}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-sm text-primary text-nowrap underline"
                >
                  Amount Breakup
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Amount Breakup</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  {orderPricing ? (
                    <>
                      <div className="flex justify-between">
                        <span>Clean Price </span>
                        <span className="font-medium">
                          {formatCleanPricePercent(orderPricing.cleanPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Principal Amount</span>
                        <span className="font-medium">
                          Rs. {formatNumberTS(principalScaled ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accrued interest</span>
                        <span className="font-medium">
                          Rs. {formatNumberTS(accruedScaled ?? 0)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Total Consideration</span>
                        <span className="font-medium">
                          Rs. {formatNumberTS(totalConsideration)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stamp duty</span>
                        <span className="font-medium">
                          Rs. {formatNumberTS(stampScaled)}
                        </span>
                      </div>
                      <div className="flex justify-between ">
                        <span>Accrued Interest Days</span>
                        <span>
                          {orderPricing.noOfAccrualDays}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-amber-900 dark:text-amber-200">
                      Live pricing from DeriData is unavailable. Refresh or change
                      quantity to retry.
                    </p>
                  )}
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-base">
                    <span className="font-semibold">Settlement Amount</span>
                    <span className="font-semibold">
                      Rs. {formatNumberTS(settlementAmount)}
                    </span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {
          !orderPricing?.allowTrade && <p className="text-sm text-red-500 mt-8">Trading is currently unavailable as the market is closed. Please try again during market hours or contact support for assistance.</p>
        }
        {
          !outOfStock && (orderPricing?.allowTrade || allowTrade) && <>
            <label className="flex justify-start mt-5 gap-3">
              <Checkbox
                className="mt-[2px]"
                checked={isChecked}
                onClick={() => {
                  const newValue = !isChecked;
                  setIsChecked(newValue);
                  trackCheckboxInteraction(orderId, "BROKER_PERMISSION", newValue);
                }}
              />
              <p className="text-sm">
                I hereby give MeraDhan permission to act as my broker and to send or
                respond to fixed (non-negotiable) quotes for this security on the
                RFQ platform (One to One Mode) of any stock exchange, and to take
                any steps needed to complete the transaction.
              </p>
            </label>
            <div className="mt-8">
              <Dialog>
                <DialogTrigger disabled={!isChecked}>
                  <Button
                    className="md:w-auto w-full"
                    disabled={!isChecked}
                    onClick={() => {
                      if (isChecked) {
                        trackButtonClick(orderId, "CONFIRM_CONTINUE_REVIEW", {
                          step: 1,
                        });
                      }
                    }}
                  >
                    Confirm & Continue <IoMdArrowDropright />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="text-center gap-4 flex flex-col items-center">
                    <Image
                      src={`/images/icons/self-declaration.svg`}
                      width={60}
                      alt=""
                      height={60}
                    />
                    <DialogTitle className="font-medium">
                      Risk Understanding & Self-Declaration
                    </DialogTitle>
                  </DialogHeader>
                  <label className="text-sm flex gap-3">
                    <Checkbox
                      className="mt-[2px]"
                      checked={isCheckedRisk}
                      onClick={() => {
                        const newValue = !isCheckedRisk;
                        setIsCheckedRisk(newValue);
                        trackCheckboxInteraction(orderId, "RISK_DECLARATION", newValue);
                      }}
                    />
                    <p>
                      I confirm that I have read and understood all the documents
                      related to this security. I am aware that the credit rating of
                      the selected security{" "}
                      <strong>{bond.description}</strong> is{" "}
                      <strong>{bond.creditRating}</strong>. I am investing in this bond after
                      fully understanding the risks involved. This investment
                      decision is my own and has not been influenced by any advice,
                      suggestion, or recommendation from MeraDhan.
                    </p>
                  </label>

                  <div className="mt-4 flex justify-center gap-4">
                    <Button
                      disabled={!isCheckedRisk}
                      onClick={() => {
                        trackButtonClick(orderId, "CONFIRM_CONTINUE_DIALOG", {
                          step: 1,
                          nextStep: 2,
                        });
                        setStep(step + 1);
                      }}
                    >
                      Confirm & Continue <IoMdArrowDropright />
                    </Button>
                    <DialogTrigger>
                      <Button
                        variant="outline"
                        onClick={() => {
                          trackButtonClick(orderId, "CANCEL_DIALOG", {
                            step: 1,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </DialogTrigger>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        }
      </div>
      <div className="flex gap-2 flex-col">
        <p className="font-semibold mt-10">Note:</p>
        <p>
          The securities listed above are not an advertisement, recommendation,
          or invitation to buy or sell. Orders can be placed on the Stock
          Exchange RFQ platform only during market hours. The transaction will
          go through only if the counterparty accepts the deal and both the
          buyer and seller complete their payment obligations on time.
        </p>
      </div>
    </div>
  );
}

export default ReviewOrder;
