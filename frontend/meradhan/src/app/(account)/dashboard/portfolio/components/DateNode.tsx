import DateBadge from "./DateBadge";
import EventCard from "./EventCard";
import SpineDot from "./SpineDot";
import { CashflowDate } from "./type";

interface Props {
  dateData: CashflowDate;
}

 function DateNode({ dateData }: Props) {
  const isLeft = dateData.side === "left";

  return (
    <div className="flex items-start mb-10">
      <div className="flex-1 flex justify-end">
        {isLeft && (
          <div className="flex flex-col items-end gap-3">
            <DateBadge date={dateData.date} totalPayout={dateData.totalPayout} />
            <div className="flex flex-col gap-2 mr-9">
              {dateData.events.map((e, i) => (
                <EventCard key={i} event={e} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="w-10 flex justify-center pt-3">
        <SpineDot />
      </div>
      <div className="flex-1 flex justify-start">
        {!isLeft && (
          <div className="flex flex-col items-start gap-3">
            <DateBadge date={dateData.date} totalPayout={dateData.totalPayout} />
            <div className="flex flex-col gap-2 ml-9">
              {dateData.events.map((e, i) => (
                <EventCard key={i} event={e} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default DateNode;