import { Plus } from "lucide-react";
import React from "react";

function BondAddToWatchList() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-secondary rounded-sm p-[2px]">
        <Plus size={15} className="text-white" />
      </div>
      <p className="font-medium text-gray-500 text-sm">Watchlist</p>
    </div>
  );
}

export default BondAddToWatchList;
