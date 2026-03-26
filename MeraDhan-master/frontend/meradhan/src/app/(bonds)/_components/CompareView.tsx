"use client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";
import { useCompareSelectStore } from "../_hooks/useCompareSelectStore";

interface CompareItem {
  name: string;
  issuePrice: string;
  faceValue: string;
  coupon: string;
}

const CompareView: React.FC = () => {
  const { clearItems, removeItem, selectedItems } = useCompareSelectStore();

  const clearAll = () => {
    clearItems();
  };

  if (selectedItems.length === 0) {
    return null; // Don't render anything if no items are selected
  }

  return (
    <div className="bottom-0 left-0 z-50 fixed w-full">
      <div className="flex flex-col justify-between items-center mx-auto px-4 py-3 max-w-7xl">
        {/* Cards Section */}
        <div className="flex lg:flex-row flex-col gap-3 bg-white shadow-sm p-2 rounded-xl overflow-x-auto">
          {selectedItems.length > 0 ? (
            selectedItems.map((item, index) => (
              <CompareViewCard
                key={index}
                coupon={item.couponRate.toString()}
                faceValue={item.faceValue.toString()}
                issuePrice={item.issuePrice.toString()}
                name={item.bondName}
                onRemove={() => removeItem(item.id)}
              />
            ))
          ) : (
            <p className="py-4 text-gray-500 text-sm italic">
              No companies selected for comparison
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-3">
          {/* // allow min 2 */}
          <Button
            disabled={selectedItems.length < 2}
            onClick={() => {
              window.location.href =
                "/bonds/comparison?bonds=" +
                JSON.stringify(selectedItems.map((item) => item.isin));
            }}
          >
            Proceed to Compare
          </Button>
          <Button
            onClick={clearAll}
            variant={`destructive`}
            disabled={selectedItems.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompareView;

interface CompareViewCardProps extends CompareItem {
  onRemove: () => void;
}

const CompareViewCard: React.FC<CompareViewCardProps> = ({
  name,
  issuePrice,
  faceValue,
  coupon,
  onRemove,
}) => {
  return (
    <div className="relative bg-blue-50 p-4 rounded-xl w-80 shrink-0">
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="top-2 right-2 absolute text-red-500 hover:text-red-700 transition"
      >
        <X size={16} />
      </button>

      {/* Title */}
      <h2 className="mb-3 font-semibold text-gray-800 text-sm line-clamp-1 leading-snug">
        {name}
      </h2>

      {/* Info Grid */}
      <div className="grid grid-cols-3 text-gray-700 text-sm">
        <div>
          <p className="text-gray-600">Issue Price</p>
          <p className="font-medium">{issuePrice}</p>
        </div>
        <div>
          <p className="text-gray-600">Face Value</p>
          <p className="font-medium">{faceValue}</p>
        </div>
        <div>
          <p className="text-gray-600">Coupon</p>
          <p className="font-medium">{coupon}</p>
        </div>
      </div>
    </div>
  );
};
