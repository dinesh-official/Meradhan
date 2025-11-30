import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import React from "react";
import BondInfoData from "../_components/BondInfoData";
import { TiStarFullOutline } from "react-icons/ti";
import { getRatingColor } from "@/global/components/Bond/CreaditRatingBadge";
import { MdDelete } from "react-icons/md";
import { BondInfoLabel } from "@/global/components/Bond/BondInfoLabel";
import { PiCurrencyInrBold } from "react-icons/pi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Checkbox } from "@/components/ui/checkbox";
import { IoMdArrowDropright } from "react-icons/io";
function page() {
  return (
    <ViewPort>
      <div className="mb-4 container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Place Order</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <SectionWrapper>
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
                <BondInfoData />
              </div>
              <RatingOrDelete />
            </div>
          </div>
          <div className="md:hidden mt-5">
            <BondInfoData />
          </div>
          <div className="mt-5 border-t md:border md:p-8 pt-5 border-gray-200 md:rounded-[10px]">
            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2  md:gap-y-10 gap-y-5 gap-x-6">
              <BondInfoLabel title="Yield to Maturity">
                <p className="text-black">11.0000%</p>
              </BondInfoLabel>

              <BondInfoLabel title="Coupon Rate">
                <p className="text-black">10.7500%</p>
              </BondInfoLabel>

              <BondInfoLabel title="Face Value">
                <p className="text-black flex items-center gap-1">
                  <PiCurrencyInrBold /> 1,00,000.00
                </p>
              </BondInfoLabel>

              <BondInfoLabel title="Maturity Date">
                <p className="text-black flex items-center gap-1">
                  25 Jan 2027
                </p>
              </BondInfoLabel>

              <BondInfoLabel title="Face Value">
                <p className="text-black flex items-center gap-1">
                  <PiCurrencyInrBold /> 98.8842
                </p>
              </BondInfoLabel>

              <BondInfoLabel title="Deal Date (Trade Date)">
                <p className="text-black flex items-center gap-1">
                  25 Nov 2025 (Wednesday)
                </p>
              </BondInfoLabel>

              <BondInfoLabel title="Settlement Date">
                <Select value="t+1">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="26 Nov 2025 (T + 1)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t+1">26 Nov 2025 (T + 1)</SelectItem>
                    <SelectItem value="t+0">Today (T + 0)</SelectItem>
                  </SelectContent>
                </Select>
              </BondInfoLabel>

              <BondInfoLabel title="Quantity of Bonds">
                <div className="flex items-center w-full border border-[#E1E6E8] rounded-md ">
                  <Button className="bg-[#E1E6E8] text-black font-semibold  text-lg  rounded-r-none">
                    -
                  </Button>
                  <input
                    type="text"
                    className="w-full text-center border-0 border-none"
                    defaultValue={1}
                  />
                  <Button className="bg-[#E1E6E8] text-black  text-lg font-semibold rounded-l-none">
                    +
                  </Button>
                </div>
              </BondInfoLabel>
            </div>

            <p className="font-semibold mt-4">Demat Account Details</p>
            <div className="grid md:grid-cols-4 grid-cols-2 mt-4 gap-5">
              <DataInfoLabel
                title="DP ID"
                status="SUCCESS"
                statusLabel="Verified"
                showStatus
              >
                <p className="flex items-center gap-2 text-black ">12081601</p>
              </DataInfoLabel>
              <DataInfoLabel
                title="Ben. / Client ID"
                status="SUCCESS"
                statusLabel="Verified"
                showStatus
              >
                <p className="flex items-center gap-2 text-black ">12081601</p>
              </DataInfoLabel>
              <DataInfoLabel title="Depository">
                <p className="flex items-center gap-2 text-black ">CDSL</p>
              </DataInfoLabel>
              <DataInfoLabel title="Demat Account Type">
                <p className="flex items-center gap-2 text-black ">SOLE</p>
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
                  ICIC0004081
                </p>
              </DataInfoLabel>
              <DataInfoLabel
                title="Account Number"
                status="SUCCESS"
                statusLabel="Verified"
                showStatus
              >
                <p className="flex items-center gap-2 text-black ">
                  000701632678
                </p>
              </DataInfoLabel>
              <DataInfoLabel title="Bank Name">
                <p className="flex items-center gap-2 text-black ">
                  ICICI Bank
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
                  <PiCurrencyInrBold /> 99,699.10
                </p>
                <p className="text-sm text-primary text-nowrap">
                  Amount Breakup
                </p>
              </div>
            </div>
            <label className="flex justify-start mt-5 gap-3">
              <Checkbox className="mt-[2px]" />
              <p className="text-sm">
                I hereby give MeraDhan permission to act as my broker and to
                send or respond to fixed (non-negotiable) quotes for this
                security on the RFQ platform (One to One Mode) of any stock
                exchange, and to take any steps needed to complete the
                transaction.
              </p>
            </label>
            <div className="mt-8">
              <Button className="md:w-auto w-full">
                Confirm & Continue <IoMdArrowDropright />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 flex-col">
            <p className="font-semibold mt-10">Note:</p>
            <p>
              The securities listed above are not an advertisement,
              recommendation, or invitation to buy or sell. Orders can be placed
              on the Stock Exchange RFQ platform only during market hours. The
              transaction will go through only if the counterparty accepts the
              deal and both the buyer and seller complete their payment
              obligations on time.
            </p>
          </div>
        </div>
      </SectionWrapper>
    </ViewPort>
  );
}

export default page;
function RatingOrDelete() {
  return (
    <div className="flex md:flex-row flex-col md:items-center items-end gap-3">
      <div
        className="text-white flex items-center gap-2 w-[79px] text-sm h-7 rounded-md justify-center"
        style={{
          backgroundColor: getRatingColor("AAA"),
        }}
      >
        <TiStarFullOutline />
        <span>AAA</span>
      </div>
      <MdDelete className="text-gray-400 cursor-pointer " size={22} />
    </div>
  );
}
