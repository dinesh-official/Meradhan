// import TimelineFilters from "./TimelineFilters";
// import YearSection from "./YearSection";
// import { CashflowYear } from "./type";

// interface Props {
//   data: CashflowYear[];
// }

// const TimelinePage = ({ data }: Props) => {
//   return (
//     <div className="w-full max-w-[1200px] mx-auto py-10">

//       <TimelineFilters />

//       {data.map((year, index) => (
//         <YearSection key={index} yearData={year} />
//       ))}

//     </div>
//   );
// };

// export default TimelinePage;



import TimelineFilters, { type ActiveFilters } from "./TimelineFilters";
import YearSection from "./YearSection";
import { CashflowYear } from "./type";
import { useState } from "react";
import {
  DEFAULT_CASHFLOW_PERIOD,
  getCashflowPeriodRange,
} from "./cashflowPeriodPresets";

interface Props {
  data: CashflowYear[];
}

const TimelinePage = ({ data }: Props) => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(() => {
    const { fromDate, toDate } = getCashflowPeriodRange(DEFAULT_CASHFLOW_PERIOD);
    return { types: [], period: DEFAULT_CASHFLOW_PERIOD, fromDate, toDate };
  });

  return (
    <div>
      <TimelineFilters
        timelineData={data}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
      />

      {data.map((year, index) => (
        <YearSection key={index} yearData={year} />
      ))}
    </div>
  );
};

export default TimelinePage;