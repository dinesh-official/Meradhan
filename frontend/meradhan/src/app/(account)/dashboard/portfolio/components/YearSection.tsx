import YearPill from "./YearPill";
import { CashflowYear, CashflowEvent } from "./type";
import DateBadge from "./DateBadge";
import ArrowLeft from "./ArrowLeft";
import ArrowRight from "./ArrowRight";
import EventCard from "./EventCard";
import SpineDot from "./SpineDot";

interface Props {
  yearData: CashflowYear;
}

const YearSection = ({ yearData }: Props) => {
  return (
    <div className="w-full mb-24">

      <div className="flex justify-center mb-14">
        <YearPill
          year={yearData.year}
          totalPayout={yearData.totalPayout}
        />
      </div>

      <div className="relative">

        <div className="absolute left-1/2 -translate-x-1/2 top-[-57px] bottom-[-96px] w-[2px] bg-[#E1E6E8]" />

        <div className="flex flex-col">

          {yearData.dates.map((dateData, idx) => {
            const isLeft = dateData.side === "left";

            return (
              <div key={idx} className="relative flex items-start mb-24">

                <div className="flex-1 flex justify-end">
                  {isLeft && <LeftTimeline dateData={dateData} />}
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 z-10 mt-[22px]">
                  <SpineDot />
                </div>

                <div className="flex-1 flex justify-start">
                  {!isLeft && <RightTimeline dateData={dateData} />}
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default YearSection;

interface TimelineProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dateData: any;
}



const LeftTimeline = ({ dateData }: TimelineProps) => {

  const verticalHeight =
    dateData.events.length > 1 ? "h-[69%]" : "h-[45.5%]";

  return (
    <div className="relative flex flex-col items-end">

      <div className="flex items-center mb-10 mr-[15px]">
        <DateBadge {...dateData} />
        <ArrowRight />
      </div>

      <div
        className={`absolute right-[45px] top-[62px] w-[1.5px] bg-[#E1E6E8] ${verticalHeight}`}
      />

      <div className="flex flex-col gap-[40px] mr-[90px]">

        {dateData.events.map((e: CashflowEvent, i: number) => (
          <div key={i} className="relative flex items-center">

            <div className="absolute right-[-45px] w-[45px] h-[1.5px] bg-[#E1E6E8]" />

            <EventCard event={e} />

          </div>
        ))}

      </div>

    </div>
  );
};



const RightTimeline = ({ dateData }: TimelineProps) => {

  const verticalHeight =
    dateData.events.length > 1 ? "h-[69%]" : "h-[45.5%]";

  return (
    <div className="relative flex flex-col items-start">

      <div className="flex items-center mb-10 ml-[15px]">
        <ArrowLeft />
        <DateBadge {...dateData} />
      </div>

      <div
        className={`absolute left-[45px] top-[62px] w-[1.5px] bg-[#E1E6E8] ${verticalHeight}`}
      />

      <div className="flex flex-col gap-[40px] ml-[90px]">

        {dateData.events.map((e: CashflowEvent, i: number) => (
          <div key={i} className="relative flex items-center">

            <div className="absolute left-[-45px] w-[45px] h-[1.5px] bg-[#E1E6E8]" />

            <EventCard event={e} />

          </div>
        ))}

      </div>

    </div>
  );
};