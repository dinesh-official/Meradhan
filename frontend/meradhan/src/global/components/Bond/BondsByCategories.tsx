import { cn } from "@/lib/utils";
import { BsFillBuildingsFill } from "react-icons/bs";
import { FaCrown, FaTaxi } from "react-icons/fa6";
import CategorySlider from "./CategorySlider";
import SectionTitleDesc from "../basic/section/SectionTitleDesc";
import SectionWrapper from "../basic/section/SectionWrapper";
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
  },
];

function BondsByCategories() {
  return (
    <SectionWrapper>
      <div className="flex flex-col gap-5 container">
        <SectionTitleDesc
          title={
            <>
              <span className="font-semibold text-secondary">Bonds</span> by
              Categories
            </>
          }
          description="Explore bonds by category to find investment options that match your
          goals, risk appetite, and financial preferences."
        />

        <CategorySlider category={category} />
      </div>
    </SectionWrapper>
  );
}

export default BondsByCategories;
