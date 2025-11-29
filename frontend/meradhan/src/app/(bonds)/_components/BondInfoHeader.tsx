import { cn } from "@/lib/utils";
import { BondDetailResponse } from "@root/apiGateway";
import { FaStar } from "react-icons/fa6";

function BondInfoHeader({
  bond,
}: {
  bond: BondDetailResponse["responseData"];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex md:flex-row flex-col justify-between md:items-center gap-5">
        <p className={cn("font-medium text-2xl", "quicksand-medium")}>
          ISIN:{" "}
          <span className="font-semibold text-secondary">{bond.isin}</span>
        </p>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 bg-muted px-2 py-0.5 rounded-sm max-w-[350px] text-primary">
            <div className="w-5">
              <FaStar size={17} className="text-secondary" />
            </div>
            <span className="text-sm line-clamp-1">
              {bond.creditRatingInfo}
            </span>
          </div>
          {/* <BondAddToWatchList /> */}
        </div>
      </div>
      <h2 className={cn("text-2xl md:text-3xl quicksand-medium")}>
        {bond.bondName}
      </h2>
      <p className="text-base">{bond.description}</p>
    </div>
  );
}

export default BondInfoHeader;
