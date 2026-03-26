import { TiStarFullOutline } from "react-icons/ti";
import { getRatingColor } from "@/global/components/Bond/CreaditRatingBadge";
import { MdDelete } from "react-icons/md";
export function RatingOrDelete({ rating }: { rating?: string }) {
  return (
    <div className="flex md:flex-row flex-col md:items-center items-end gap-3">
      <div
        className="text-white flex items-center gap-2 w-[79px] text-sm h-7 rounded-md justify-center"
        style={{
          backgroundColor: getRatingColor(rating || "AAA"),
        }}
      >
        <TiStarFullOutline />
        <span>{rating || "AAA"}</span>
      </div>
      <MdDelete className="text-gray-400 cursor-pointer " size={22} />
    </div>
  );
}
