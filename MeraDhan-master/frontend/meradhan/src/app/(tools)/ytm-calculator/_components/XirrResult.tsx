"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getXirr, prepareXirrValues, XirrResult as XirrResultType } from "../_helpers/xirr";
import { TrendingUp, TrendingDown, Calculator, IndianRupee } from "lucide-react";

interface XirrResultProps {
  xirrData: XirrResultType;
}

export function XirrResult({ xirrData }: XirrResultProps) {
  const values = prepareXirrValues(xirrData.cashflow);
  const xirrRate = getXirr(values);
  
  const totalInvestment = Math.abs(xirrData.cashflow[0]?.amount || 0);
  const totalCoupons = xirrData.cashflow
    .filter(f => f.type === 'Coupon')
    .reduce((sum, f) => sum + f.amount, 0);
  const principalRepayment = xirrData.cashflow
    .filter(f => f.type === 'Principal')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const totalReturns = totalCoupons + principalRepayment;
  const absoluteGain = totalReturns - totalInvestment;
  const gainPercentage = (absoluteGain / totalInvestment) * 100;

  const formatXirr = (rate: number | string): string => {
    if (typeof rate === "number") {
      return `${(rate * 100).toFixed(2)}%`;
    }
    return "N/A";
  };

  const getXirrColor = (rate: number | string): string => {
    if (typeof rate === "number") {
      if (rate > 0.08) return "text-green-600";
      if (rate > 0.05) return "text-yellow-600";
      return "text-red-600";
    }
    return "text-gray-600";
  };

  const getXirrIcon = (rate: number | string) => {
    if (typeof rate === "number" && rate > 0) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* XIRR Rate */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">XIRR (Yield)</CardTitle>
          {getXirrIcon(xirrRate)}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getXirrColor(xirrRate)}`}>
            {formatXirr(xirrRate)}
          </div>
          <p className="text-muted-foreground text-xs">
            Annualized return rate
          </p>
        </CardContent>
      </Card>

      {/* Total Investment */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Investment</CardTitle>
          <IndianRupee className="w-5 h-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-blue-600 text-2xl">
            ₹{totalInvestment.toLocaleString('en-IN')}
          </div>
          <p className="text-muted-foreground text-xs">
            Including accrued interest
          </p>
        </CardContent>
      </Card>

      {/* Total Returns */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Returns</CardTitle>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-green-600 text-2xl">
            ₹{totalReturns.toLocaleString('en-IN')}
          </div>
          <p className="text-muted-foreground text-xs">
            Coupons + Principal
          </p>
        </CardContent>
      </Card>

      {/* Absolute Gain */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Absolute Gain</CardTitle>
          <Calculator className="w-5 h-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${absoluteGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{Math.abs(absoluteGain).toLocaleString('en-IN')}
          </div>
          <p className="text-muted-foreground text-xs">
            {gainPercentage.toFixed(2)}% of investment
          </p>
        </CardContent>
      </Card>

      {/* Bond Details */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Bond Analysis Summary</CardTitle>
          <CardDescription>
            Key metrics and breakdown of your bond investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-medium">Payment Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Coupon Payments:</span>
                  <span className="font-medium">₹{totalCoupons.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Principal Repayment:</span>
                  <span className="font-medium">₹{principalRepayment.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Accrued Interest:</span>
                  <span className="font-medium">₹{xirrData.accruedInterest.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="mb-2 font-medium">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XIRR (Annualized):</span>
                  <Badge variant={typeof xirrRate === "number" && xirrRate > 0.06 ? "default" : "secondary"}>
                    {formatXirr(xirrRate)}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Return:</span>
                  <span className="font-medium">{gainPercentage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Days to Maturity:</span>
                  <span className="font-medium">{xirrData.dayDiff} days</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="mb-2 font-medium">Return Distribution</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Coupon Income</span>
                    <span>{((totalCoupons / totalReturns) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(totalCoupons / totalReturns) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Capital Return</span>
                    <span>{((principalRepayment / totalReturns) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(principalRepayment / totalReturns) * 100} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}