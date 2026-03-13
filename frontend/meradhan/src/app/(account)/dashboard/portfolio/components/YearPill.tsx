interface Props {
  year: number;
  totalPayout: number;
}

function YearPill({ year, totalPayout }: Props) {
  return (
    <div className="flex justify-center my-3">
      <div className="bg-[#0C4580] text-white rounded-[8px] px-8 py-2 text-center min-w-[240px]">
        <div className="text-[16px] font-semibold">{year}</div>
        <div className="text-[14px] opacity-90">
          <strong>Total Payouts:  ₹ </strong>{totalPayout.toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}
export default YearPill;