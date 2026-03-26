import InfoIcon from "./InfoIcon";
import { CashflowEvent } from "./type";

interface Props {
  event: CashflowEvent;
}

export default function EventCard({ event }: Props) {
  const isInterest = event.type === "INTEREST";

  return (
    <div className="relative w-[300px] bg-white border border-[#E1E6E8] rounded-[8px] p-[20px] shadow-sm card-container">

      <div className="absolute top-3 right-3">
        <InfoIcon />
      </div>

      <span
        className={`inline-block mb-3 px-3 py-1 text-[12px] font-semibold rounded-[5px] ${
          isInterest
            ? "bg-[#008C3B] text-white"
            : "bg-[#5B2DA3] text-white"
        }`}
      >
        {isInterest ? "Interest Payout" : "Maturity Payout"}
      </span>

      <div className="text-[14px] font-semibold text-black leading-snug pr-6">
        {event.bondName}
      </div>

      <div className="text-[14px] mt-2">
        <strong>Amount: ₹ </strong>
        {event.amount.toLocaleString("en-IN")}
      </div>
    </div>
  );
}