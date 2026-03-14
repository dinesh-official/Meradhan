"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import type { PortfolioDetailsResponse } from "@root/apiGateway";
import { Fragment } from "react";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

interface PortfolioFilterOptions {
  bondTypes: string[];
  bondRatings: string[];
  couponRanges: string[];
  paymentFrequencies: string[];
}

export default function PortfolioDetails() {
  const [filters, setFilters] = useState({
    bondType: [] as string[],
    bondRating: [] as string[],
    coupon: [] as string[],
    paymentFrequency: [] as string[],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const itemsPerPage = 10;

  const setFilterValues = (key: keyof typeof filters, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setCurrentPage(1);
    setExpandedRow(null);
  };

  const toggleRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const portfolioApi = new apiGateway.meradhan.customerPortfolioApi(
    apiClientCaller
  );

  const { data: filtersResponse } = useQuery<{
    responseData: PortfolioFilterOptions;
  }>({
    queryKey: ["portfolioFilterOptions"],
    queryFn: async () => {
      const { data } = await apiClientCaller.get<{
        responseData: PortfolioFilterOptions;
      }>("/customer/portfolio/details/filters");
      return data;
    },
  });

  const {
    data: portfolioData,
    isLoading,
    error,
  } = useQuery<PortfolioDetailsResponse>({
    queryKey: [
      "portfolioDetails",
      currentPage,
      filters.bondType.join("|"),
      filters.bondRating.join("|"),
      filters.coupon.join("|"),
      filters.paymentFrequency.join("|"),
    ],
    queryFn: async () => {
      const response = await portfolioApi.getPortfolioDetails({
        page: currentPage,
        limit: itemsPerPage,
        bondTypes: filters.bondType.length ? filters.bondType : undefined,
        bondRatings: filters.bondRating.length ? filters.bondRating : undefined,
        couponRanges: filters.coupon.length ? filters.coupon : undefined,
        paymentFrequencies: filters.paymentFrequency.length
          ? filters.paymentFrequency
          : undefined,
      });

      return response.responseData;
    },
  });

  const bondData = portfolioData?.data ?? [];
  const totalPages = portfolioData?.meta?.totalPages ?? 0;

  const apiFilterOptions = filtersResponse?.responseData;
  const filterOptions = {
    bondType: apiFilterOptions?.bondTypes ?? [],
    bondRating: apiFilterOptions?.bondRatings ?? [],
    coupon: apiFilterOptions?.couponRanges ?? [],
    paymentFrequency: apiFilterOptions?.paymentFrequencies ?? [],
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    setExpandedRow(null);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    setExpandedRow(null);
  };

  return (
    <div className="p-0 bg-white rounded-xl">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8">
        <MultiSelect
          values={filters.bondType}
          onValuesChange={(values) => setFilterValues("bondType", values)}
        >
          <MultiSelectTrigger className="md:max-w-[250px] w-full justify-between">
            <MultiSelectValue placeholder="Bond Type" />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectGroup>
              {filterOptions.bondType.map((option) => (
                <MultiSelectItem key={option} value={option}>
                  {option}
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>

        <MultiSelect
          values={filters.bondRating}
          onValuesChange={(values) => setFilterValues("bondRating", values)}
        >
          <MultiSelectTrigger className="md:max-w-[250px] w-full justify-between">
            <MultiSelectValue placeholder="Bond Rating" />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectGroup>
              {filterOptions.bondRating.map((option) => (
                <MultiSelectItem key={option} value={option}>
                  {option}
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>

        <MultiSelect
          values={filters.coupon}
          onValuesChange={(values) => setFilterValues("coupon", values)}
        >
          <MultiSelectTrigger className="md:max-w-[250px] w-full justify-between">
            <MultiSelectValue placeholder="Coupon" />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectGroup>
              {filterOptions.coupon.map((option) => (
                <MultiSelectItem key={option} value={option}>
                  {option.includes("%") ? option : `${option}%`}
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>

        <MultiSelect
          values={filters.paymentFrequency}
          onValuesChange={(values) =>
            setFilterValues("paymentFrequency", values)
          }
        >
          <MultiSelectTrigger className="md:max-w-[250px] w-full justify-between">
            <MultiSelectValue placeholder="Payment Frequency" />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectGroup>
              {filterOptions.paymentFrequency.map((option) => (
                <MultiSelectItem key={option} value={option}>
                  {option}
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-semibold">Error loading portfolio</p>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="overflow-x-auto common-table-wrapper">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "200px" }} />
                <col style={{ width: "160px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "170px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "160px" }} />
                <col style={{ width: "130px" }} />
              </colgroup>

              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">Security Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">ISIN</th>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">Bond Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">Coupon</th>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">Investment Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">Face Value</th>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">Quantity</th>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">Interest Frequency</th>
                  <th className="px-4 py-3 text-left font-semibold text-black text-[12px]">Maturity Date</th>
                </tr>
              </thead>

              <tbody>
                {bondData.length > 0 ? (
                  bondData.map((bond) => (
                    <Fragment key={bond.id}>
                      <tr
                        onClick={() => toggleRow(bond.id)}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-4 max-w-xs min-w-[200px]">
                          <div className="font-medium text-[14px] text-black truncate">
                            {bond.securityName}
                          </div>
                          <div className="text-[12px] text-[#666666] truncate">
                            {bond.instrumentName || "N/A"}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-black">{bond.isin}</td>

                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-3 rounded-[5px] text-[12px] font-semibold whitespace-nowrap capitalize ${
                              bond.bondType === "corporate"
                                ? "bg-[#775DD0] text-white"
                                : bond.bondType === "PSU"
                                ? "bg-[#FF4560] text-white"
                                : bond.bondType === "Government"
                                ? "bg-[#0C4580] text-white"
                                : "bg-[#4ecdc4] text-white"
                            }`}
                          >
                            {bond.bondType || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-black">
                          {Number(bond.coupon).toFixed(2)}%
                        </td>

                        <td className="px-4 py-4 text-black font-medium whitespace-nowrap">
                          ₹{" "}
                          {bond.investmentAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        <td className="px-4 py-4 text-black font-medium whitespace-nowrap">
                          ₹{" "}
                          {bond.faceValue.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        <td className="px-4 py-4 text-black">{bond.quantity}</td>

                        <td className="px-4 py-4 text-black">
                          {bond.interestFrequency || "N/A"}
                        </td>

                        <td className="px-4 py-4 text-black whitespace-nowrap">
                          {bond.maturityDate
                            ? new Date(bond.maturityDate).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </td>
                      </tr>

                      {expandedRow === bond.id && (
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <td colSpan={9} className="px-4 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                              <Detail label="Description" value={bond.description} />
                              <Detail label="Credit Rating" value={bond.creditRating} />
                              <Detail label="Sector Name" value={bond.sectorName} />
                              <Detail label="Tax Status" value={bond.taxStatus} />
                              <Detail label="Yield" value={bond.yield} />
                              <Detail label="Last Trade Yield" value={bond.lastTradeYield} />
                              <Detail label="Last Trade Price" value={bond.lastTradePrice} />
                              <Detail label="Mode Of Issuance" value={bond.modeOfIssuance} />
                              <Detail label="Coupon Type" value={bond.couponType} />
                              <Detail
                                label="Date Of Allotment"
                                value={
                                  bond.dateOfAllotment
                                    ? new Date(bond.dateOfAllotment).toLocaleDateString("en-IN")
                                    : null
                                }
                              />
                              <Detail
                                label="Redemption Date"
                                value={
                                  bond.redemptionDate
                                    ? new Date(bond.redemptionDate).toLocaleDateString("en-IN")
                                    : null
                                }
                              />
                              <Detail label="Rating Agency" value={bond.ratingAgencyName} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No bonds found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
                {currentPage} of {totalPages}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="text-sm text-black">
              Showing{" "}
              {portfolioData?.meta.total === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{" "}
              to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                portfolioData?.meta.total || 0
              )}{" "}
              of {portfolioData?.meta.total || 0} records
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-black">{value ?? "N/A"}</p>
    </div>
  );
}