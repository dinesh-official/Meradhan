/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NSE_ISIN_DATA } from "@root/apiGateway";
import { ReactNode, useEffect, useState } from "react";
import { InputField } from "../inputs/InputField";
import { SelectField } from "../inputs/SelectField";
import NseIsinTable from "./components/NseIsinTable";
import {
  IsinFilterType,
  useNseIsinPickerState,
} from "./hooks/useNseIsinPickerState";

function NseIsinPicker({
  onSelect,
  children,
}: {
  onSelect?: (isin: NSE_ISIN_DATA) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { filters, handleChange, resetFilters, searchIsinMutation } =
    useNseIsinPickerState();

  useEffect(() => {
    const timer = setTimeout(() => {
      searchIsinMutation.mutate();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    if (!open) {
      resetFilters();
    } else {
      searchIsinMutation.mutate();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>

      <DialogContent className="min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>ISIN Lookup</DialogTitle>
          <DialogDescription>
            <div className="gap-5 grid grid-cols-3 mt-5">
              <InputField
                label="Symbol (ISIN)"
                id="symbol"
                placeholder="Enter ISIN"
                value={filters.symbol || ""}
                onChangeAction={(e) => handleChange("symbol", e)}
              />

              <InputField
                label="Description"
                id="description"
                placeholder="Enter Description"
                value={filters.description || ""}
                onChangeAction={(e) => handleChange("description", e)}
              />

              <InputField
                label="Issuer"
                id="issuer"
                placeholder="Enter Issuer"
                value={filters.issuer || ""}
                onChangeAction={(e) => handleChange("issuer", e)}
              />

              <SelectField
                label="Issue Category"
                value={filters.filtIssueCategory || ""}
                onChangeAction={(value) =>
                  handleChange(
                    "filtIssueCategory",
                    value as IsinFilterType["filtIssueCategory"]
                  )
                }
                options={[
                  { label: "CB", value: "CB" },
                  { label: "CP", value: "CP" },
                  { label: "CD", value: "CD" },
                  { label: "SD", value: "SD" },
                  { label: "GS", value: "GS" },
                ]}
              />

              <SelectField
                label="Maturity"
                value={filters.filtMaturity || ""}
                onChangeAction={(value) =>
                  handleChange(
                    "filtMaturity",
                    value as IsinFilterType["filtMaturity"]
                  )
                }
                options={[
                  { label: "0-1", value: "0^1" },
                  { label: "1-3", value: "1^3" },
                  { label: "3-5", value: "3^5" },
                  { label: "5-7", value: "5^7" },
                  { label: "7-10", value: "7^10" },
                  { label: "10+", value: "10^" },
                ]}
              />

              <SelectField
                label="Coupon Rate"
                value={filters.filtCoupon || ""}
                onChangeAction={(value) =>
                  handleChange(
                    "filtCoupon",
                    value as IsinFilterType["filtCoupon"]
                  )
                }
                options={[
                  { label: "0-3%", value: "0^3" },
                  { label: "3-5%", value: "3^5" },
                  { label: "5-6%", value: "5^6" },
                  { label: "6-7%", value: "6^7" },
                  { label: "7-8%", value: "7^8" },
                  { label: "8-9%", value: "8^9" },
                  { label: "9-10%", value: "9^10" },
                  { label: "10%+", value: "10^" },
                ]}
              />
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-96 overflow-auto">
          <NseIsinTable
            data={searchIsinMutation.data?.data?.responseData.data || []}
            loading={searchIsinMutation.isPending}
            onClickRow={(e) => {
              onSelect?.(e);
              setOpen(false);
            }}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
          <Button onClick={() => searchIsinMutation.mutate()}>Search</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NseIsinPicker;
