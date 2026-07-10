import dayjs from "dayjs";
import CalendarIcon from "./CalendarIcon";

interface Props {
  date: string;
  totalPayout: number;
}

 function DateBadge({ date, totalPayout }: Props) {
  return (
    <div className="bg-white border border-[#9BC1E3] rounded-[5px] px-4 py-2 inline-block min-w-[230px] pl-[19px]">
      <div className="flex items-center gap-2 mb-1">
        <CalendarIcon />
        <span className="text-[14px] font-semibold text-[#0C4580]">
          {dayjs(date).format("DD MMM YYYY")}
        </span>
      </div>
      <div className="text-[14px] text-black">
        <strong>Total Payouts: ₹</strong> {totalPayout.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

export default DateBadge; 