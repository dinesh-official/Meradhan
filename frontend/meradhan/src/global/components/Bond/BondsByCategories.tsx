import SectionTitleDesc from "../basic/section/SectionTitleDesc";
import CategorySlider from "./CategorySlider";
const bondCategories = [
  {
    imageUrl: "/images/icons/latest.svg",
    categoryName: "Latest Releases",
    href: "/bonds/latest-release",
  },
  // {
  //   imageUrl: "/images/icons/government.svg",
  //   categoryName: "Government",
  //   href: "#",
  // },
  // {
  //   imageUrl: "/images/icons/sovereign-gold.svg",
  //   categoryName: "Sovereign Gold",
  //   href: "#",
  // },
  {
    imageUrl: "/images/icons/psu.svg",
    categoryName: "PSU",
    href: "/bonds/psu",
  },
  {
    imageUrl: "/images/icons/corporate.svg",
    categoryName: "Corporate",
    href: "/bonds/corporate",
  },
  {
    imageUrl: "/images/icons/tax-free.svg",
    categoryName: "Tax Free",
    href: "/bonds/tax-free",
  },
  // {
  //   imageUrl: "/images/icons/latest.svg",
  //   categoryName: "Perpetual",
  //   href: "/bonds/perpetual",
  // },
  // {
  //   imageUrl: "/images/icons/latest.svg",
  //   categoryName: "Convertible",
  //   href: "/bonds/convertible",
  // },
  {
    imageUrl: "/images/icons/latest.svg",
    categoryName: "Zero Coupon",
    href: "/bonds/zero-coupon",
  },
];

function BondsByCategories() {
  return (
    <div className="flex flex-col gap-5 container">
      <SectionTitleDesc
        title={
          <>
            <span className="font-semibold text-secondary">Bonds</span> by
            Categories
          </>
        }
        description="Explore bonds by category to find investment options that match your goals, risk appetite, and financial preferences."
      />

      <CategorySlider category={bondCategories} />
    </div>
  );
}

export default BondsByCategories;
