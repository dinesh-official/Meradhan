import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import { BsFillBuildingsFill } from "react-icons/bs";
import { FaCrown, FaTaxi } from "react-icons/fa6";
import CategorySlider from "./CategorySlider";
const category = [
  {
    icon: <FaTaxi />,
    name: "Latest Release",
    href: "#",
  },
  {
    icon: <FaTaxi />,
    name: "PSU",
    href: "#",
  },
  {
    icon: <BsFillBuildingsFill />,
    name: "Corporate",
    href: "#",
  },
  {
    icon: <FaTaxi />,
    name: "Tax Free",
    href: "#",
  },
  {
    icon: <FaTaxi />,
    name: "Zero Coupon",
    href: "#",
  },
  {
    icon: <FaTaxi />,
    name: "Government",
    href: "#",
  },
  {
    icon: <FaTaxi />,
    name: "Perpetual",
    href: "#",
  },
  {
    icon: <FaCrown />,
    name: "Sovereign Gold",
    href: "#",
  }
];

function BondsByCategories() {
  return (
    <div className="py-14">
      <div className="container flex flex-col gap-5">
        <h3
          className={cn(
            "text-center lg:text-3xl  text-2xl font-medium",
            quicksand.className
          )}
        >
          <span className="text-secondary font-semibold">Bonds</span> by
          Categories
        </h3>
        <p className="text-center">
          Explore bonds by category to find investment options that match your
          goals, risk appetite, and financial preferences.
        </p>
        <CategorySlider category={category} />
      </div>
    </div>
  );
}

export default BondsByCategories;
