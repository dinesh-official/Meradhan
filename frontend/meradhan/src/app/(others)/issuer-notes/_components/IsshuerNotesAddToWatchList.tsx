import { Plus } from "lucide-react";
import React from "react";

function IsshuerNotesAddToWatchList() {
  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <div className="bg-secondary rounded-sm p-[2px]">
        <Plus size={18} className="text-white" />
      </div>
      <p className="font-medium text-gray-500 ">Watchlist</p>
    </div>
  );
}

export default IsshuerNotesAddToWatchList;
