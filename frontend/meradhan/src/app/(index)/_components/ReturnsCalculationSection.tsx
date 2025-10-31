 import { cn } from "@/lib/utils";
import ReturnsCalculation from "./elements/ReturnsCalculation";

function ReturnsCalculationSection() {
  return (
    <div className="bg-accent py-14">
      <div className="container">
        <h3
          className={cn(
            "text-center lg:text-3xl  text-2xl  font-medium",
            "quicksand-medium"
          )}
        >
          <span className="text-secondary font-semibold">Returns</span>{" "}
          Calculation
        </h3>
        <ReturnsCalculation />
      </div>
    </div>
  );
}

export default ReturnsCalculationSection;
