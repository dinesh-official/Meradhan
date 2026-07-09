import InfoIcon from "./InfoIcon";
import { CashflowEvent } from "./type";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  event: CashflowEvent;
}

const formatInr = (amount: number) =>
  amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function EventCard({ event }: Props) {
  const isInterest = event.type === "INTEREST";

  const title = isInterest ? "Interest Payout" : "Maturity Payout";

  return (
    <div className="relative w-[300px] bg-white border border-[#E1E6E8] rounded-[8px] p-[20px] shadow-sm card-container">
      <div className="absolute top-3 right-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`About this ${title.toLowerCase()}`}
              className="rounded-full p-0.5 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B2DA3]/40"
            >
              <InfoIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="start"
            className="w-[280px] bg-white border border-[#E1E6E8] rounded-md p-4 text-[13px] text-gray-700 leading-relaxed shadow-lg"
          >
            <div className="font-semibold text-black text-[14px] mb-3">
              {title}
            </div>
            <dl className="space-y-1.5 text-[12.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Bond</dt>
                <dd className="text-right font-medium text-black wrap-break-word">
                  <div>{event.bondName}</div>
                  {event.isin && (
                    <div className="text-[11px] text-gray-400 font-normal mt-0.5">
                      {event.isin}
                    </div>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Maturity Date</dt>
                <dd className="font-medium text-black">{event.maturityDate}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-semibold text-black">
                  ₹ {formatInr(event.amount)}
                </dd>
              </div>
            </dl>
          </PopoverContent>
        </Popover>
      </div>

      <span
        className={`inline-block mb-3 px-3 py-1 text-[12px] font-semibold rounded-[5px] ${
          isInterest
            ? "bg-[#008C3B] text-white"
            : "bg-[#5B2DA3] text-white"
        }`}
      >
        {title}
      </span>

      <div className="text-[14px] font-semibold text-black leading-snug pr-6">
        {event.bondName}
      </div>
      {event.isin && (
        <div className="text-[12px] text-gray-500 font-medium leading-none mt-1">
          {event.isin}
        </div>
      )}

      <div className="text-[14px] mt-2">
        <strong>Amount: ₹ </strong>
        {formatInr(event.amount)}
      </div>
    </div>
  );
}