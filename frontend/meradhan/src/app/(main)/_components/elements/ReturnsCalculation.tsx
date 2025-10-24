import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiCurrencyInrBold } from "react-icons/pi";
import { ReturnCalcChart } from "./ReturnCalcChart";
function ReturnsCalculation() {
  return (
    <div className="grid lg:grid-cols-2 gap-10 mt-8">
      <div className="flex flex-col gap-10 ">
        <div>
          <div className="flex justify-between mb-4 items-center">
            <p>Investment Amount</p>
            <Input className="bg-white border-gray-200  md:w-60 w-32" />
          </div>
          <div>
            <label className="range_label">
              <input type="range" name="amount_range" className="range-input" />
            </label>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-4 items-center">
            <p>Tenure</p>
            <div className="relative">
              <Input
                className="peer pe-12 bg-white  md:w-60 w-32 border-gray-200 "
                type="text"
              />
              <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm  peer-disabled:opacity-50">
                Year
              </span>
            </div>
          </div>
          <div>
            <label className="range_label">
              <input type="range" name="amount_range" className="range-input" />
            </label>
          </div>
        </div>
        <div>
          <div className="flex justify-between  mb-4 items-center">
            <p>Return Rate</p>
            <div className="relative">
              <Input
                className="peer pe-12 bg-white  md:w-60 w-32 border-gray-200 "
                type="text"
              />
              <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm  peer-disabled:opacity-50">
                %
              </span>
            </div>
          </div>
          <div>
            <label className="range_label">
              <input type="range" name="amount_range" className="range-input" />
            </label>
          </div>
        </div>
      </div>
      <Card className="border-0">
        <CardContent>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl flex items-center">
                <PiCurrencyInrBold /> 71278071.14
              </h1>
              <p className="text-lg">
                you will get after 19 <br /> years
              </p>
              <div className="flex flex-col gap-1">
                <Label className="font-normal text-gray-600">
                  Investment Amount
                </Label>
                <p className="text-lg flex items-center ">
                  <PiCurrencyInrBold /> 4462951
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="font-normal text-gray-600">
                  Investment Amount
                </Label>
                <p className="text-lg flex items-center">
                  <PiCurrencyInrBold /> 4462951
                </p>
              </div>
            </div>
            <div>
              <ReturnCalcChart />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReturnsCalculation;
