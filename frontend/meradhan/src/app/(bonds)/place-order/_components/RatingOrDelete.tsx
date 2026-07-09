import { TiStarFullOutline } from "react-icons/ti";
import { getRatingColor } from "@/global/components/Bond/CreaditRatingBadge";
import { MdDelete } from "react-icons/md";
import { useRouter } from "nextjs-toploader/app";
import { useRazorpay } from "../_hooks/useRazorpay";
export function RatingOrDelete({ rating }: { rating?: string }) {
  const router = useRouter();
  const {cancelPayment,meradhanOrderNumber} = useRazorpay()
  return (
    <div className="flex md:flex-row flex-col md:items-center items-end gap-3">
      <div
        className="text-white flex items-center gap-2 min-w-[79px] px-3 text-sm h-7 rounded-md justify-center"
        style={{
          backgroundColor: getRatingColor(rating || "AAA"),
        }}
      >
        <TiStarFullOutline />
        <span>{rating || "AAA"}</span>
      </div>
      <MdDelete className="text-gray-400 cursor-pointer " size={22} onClick={() => {
        if (meradhanOrderNumber) {
          cancelPayment(meradhanOrderNumber, false)
        }
        router.push(`/bonds`);
      }} />
    </div>
  );
}
