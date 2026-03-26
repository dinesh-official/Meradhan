import { Button } from "@/components/ui/button";
import React from "react";
import { PiCurrencyInrBold } from "react-icons/pi";

export default function BondBuyNowCalc() {
  return (
    <div className="bg-primary py-10 pb-6 rounded-lg flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <p className="text-center text-white text-xl">Calculate Investment</p>
        <p className="text-center text-white ">
          How many bonds do you want to buy?
        </p>
        <div className="flex justify-center items-center ">
          <Button
            variant={"secondary"}
            className="border-none border-0 rounded-none rounded-l-md px-3 hover:bg-white hover:text-primary"
          >
            -
          </Button>
          <div className="bg-white px-6 py-1.5">1</div>
          <Button
            variant={"secondary"}
            className="border-none border-0 rounded-none rounded-r-md px-3 hover:bg-white hover:text-primary"
          >
            +
          </Button>
        </div>
      </div>
      <div className="px-6">
        <div className=" flex flex-col gap-3 mt-5 border-b border-gray-400/30 pb-5">
          <div className="text-white flex justify-between gap-2 items-start">
            <p>Face Value:</p>
            <p className="flex items-center">
              <PiCurrencyInrBold />
              1,00,000.00
            </p>
          </div>
          <div className="text-white flex justify-between gap-2 items-start">
            <p>Last Offered Market Value:</p>
            <p className="flex items-center">
              <PiCurrencyInrBold />
              99,699.10
            </p>
          </div>
        </div>
        <div className=" flex flex-col gap-3 mt-5 ">
          <div className="text-white flex justify-between gap-2 items-start">
            <p>
              Principal Amount* <br />
              <span className="text-xs">
                (Last Offered Market value × no. of bonds)
              </span>
            </p>
            <p className="flex items-center">
              <PiCurrencyInrBold /> 1,00,000.00
            </p>
          </div>
          <div className="text-white flex justify-between gap-2 items-start">
            <p>
              Accrued Interest till Dec 11, 2024 <br />
              <span className="text-xs ">
                (Interest earned on the bond this year)
              </span>
            </p>
            <p className="flex items-center">
              <PiCurrencyInrBold />
              99,699.10
            </p>
          </div>
          <div className="text-white flex justify-between gap-2 items-start">
            <p>Total Investment:</p>
            <p className="flex items-center">
              <PiCurrencyInrBold />
              55,00,055.26
            </p>
          </div>
        </div>
        <div className="text-white flex justify-between gap-2 items-center mt-8">
          <p>* Indicative Price</p>
          <Button
            variant={`secondary`}
            className="px-6 hover:border-white hover:border"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
