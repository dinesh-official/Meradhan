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
import { formatDateCustom } from "@/global/utils/datetime.utils";
import { formatNumberTS } from "@/global/utils/formate";
import { BondDetailsResponse, CustomerByIdPayload } from "@root/apiGateway";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import { PiCurrencyInrBold } from "react-icons/pi";
import { calculateSettlementAmount } from "../../_utils/calcAmount";
import { useOrderState } from "../../store/useOrderState";
import BondInfoData from "../BondInfoData";
import { RatingOrDelete } from "../RatingOrDelete";
import { useState, useRef, useEffect } from "react";
import { useOrderActivityTracking } from "../../_hooks/useOrderActivityTracking";
function ReviewOrder({
  bond,
  customer,
  orderId,
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
}) {
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedRisk, setIsCheckedRisk] = useState(false);

  const {
    quantity,
    setQuantity,
    setSettlementDate,
    setStep,
    settlementDate,
    step,
  } = useOrderState();

  const {
    trackQuantityChange,
    trackSettlementDateChange,
    trackCheckboxInteraction,
    trackButtonClick,
  } = useOrderActivityTracking();

  const previousQuantity = useRef(quantity);
  const previousSettlementDate = useRef(settlementDate);

  // Track quantity changes
  useEffect(() => {
    if (previousQuantity.current !== quantity) {
      trackQuantityChange(orderId, previousQuantity.current, quantity);
      previousQuantity.current = quantity;
    }
  }, [quantity, orderId, trackQuantityChange]);

  // Track settlement date changes
  useEffect(() => {
    if (previousSettlementDate.current !== settlementDate) {
      trackSettlementDateChange(orderId, settlementDate);
      previousSettlementDate.current = settlementDate;
    }
  }, [settlementDate, orderId, trackSettlementDateChange]);

  const demateAccount = customer.dematAccounts.find(
    (account) => account.isPrimary
  );

  const bankAccount = customer.bankAccounts.find(
    (account) => account.isPrimary
  );

  return (
    <div className="container">
      <h1 className="title">Review & Confirm Order</h1>
      <div className="flex mt-5">
        <div className="flex items-center md:justify-start justify-between w-full gap-4">
          <div className="border-2 items-center flex justify-center bg-white min-h-16 px-4 py-5.5  rounded-md border-gray-200">
            <img
              src="https://media.licdn.com/dms/image/v2/D5616AQHCSw6TFvHuWg/profile-displaybackgroundimage-shrink_200_800/profile-displaybackgroundimage-shrink_200_800/0/1712728211011?e=2147483647&v=beta&t=U-lbDGIHBKOPGjuB5Om5qHUUJc_RqyTypV4PW_dq6dM"
              alt="logo"
              className="w-24 rounded-md "
            />
          </div>
          <div className="md:block hidden">
            <BondInfoData bondData={bond} />
          </div>
          <RatingOrDelete rating={bond.creditRating} />
        </div>
      </div>
      <div className="md:hidden mt-5">
        <BondInfoData bondData={bond} />
      </div>
      <div className="mt-5 border-t md:border md:p-8 pt-5 border-gray-200 md:rounded-[10px]">
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2  md:gap-y-10 gap-y-5 gap-x-6">
          <BondInfoLabel title="Yield to Maturity">
            <p className="text-black">{`Coming Soon`}</p>
          </BondInfoLabel>

          <BondInfoLabel title="Coupon Rate">
            <p className="text-black">{bond.couponRate}%</p>
          </BondInfoLabel>

          <BondInfoLabel title="Face Value">
            <p className="text-black flex items-center gap-1">
              <PiCurrencyInrBold /> {formatNumberTS(bond.faceValue)}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Maturity Date">
            <p className="text-black flex items-center gap-1">
              {formatDateCustom(bond.maturityDate)}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Issue Price">
            <p className="text-black flex items-center gap-1">
              <PiCurrencyInrBold /> {formatNumberTS(bond.issuePrice)}
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Deal Date (Trade Date)">
            <p className="text-black flex items-center gap-1">
              25 Nov 2025 (Wednesday)
            </p>
          </BondInfoLabel>

          <BondInfoLabel title="Settlement Date">
            <Select
              value={settlementDate}
              onValueChange={(value) => {
                setSettlementDate(value);
                // Tracking is handled by useEffect
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="26 Nov 2025 (T + 1)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">26 Nov 2025 (T + 1)</SelectItem>
                <SelectItem value="0">Today (T + 0)</SelectItem>
              </SelectContent>
            </Select>
          </BondInfoLabel>

          <BondInfoLabel title="Quantity of Bonds">
            <div className="flex items-center w-full border border-[#E1E6E8] rounded-md ">
              <Button
                className="bg-[#E1E6E8] text-black font-semibold  text-lg  rounded-r-none"
                onClick={() => {
                  trackButtonClick(orderId, "QUANTITY_DECREASE", {
                    previousQuantity: quantity,
                    newQuantity: quantity - 1,
                  });
                  setQuantity(quantity - 1);
                }}
              >
                -
              </Button>
              <input
                type="number"
                className="w-full text-center border-0 border-none"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <Button
                className="bg-[#E1E6E8] text-black  text-lg font-semibold rounded-l-none"
                onClick={() => {
                  trackButtonClick(orderId, "QUANTITY_INCREASE", {
                    previousQuantity: quantity,
                    newQuantity: quantity + 1,
                  });
                  setQuantity(quantity + 1);
                }}
              >
                +
              </Button>
            </div>
          </BondInfoLabel>
        </div>

        <p className="font-semibold mt-4">Demate Account Details</p>
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
            <p className="text-sm">
              (Total Consideration + Stamp Duty + Other Charges)
            </p>
          </div>
          <div>
            <p className="text-lg text-black flex items-center gap-1 font-medium">
              <PiCurrencyInrBold />{" "}
              {formatNumberTS(
                calculateSettlementAmount(bond.issuePrice, quantity)
              )}
            </p>
            <p className="text-sm text-primary text-nowrap">Amount Breakup</p>
          </div>
        </div>
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
                  <b>{bond.bondName} 10.75 NCD 19AG28 FVRS10000</b> is{" "}
                  <b>{bond.creditRating}</b>. I am investing in this bond after
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
