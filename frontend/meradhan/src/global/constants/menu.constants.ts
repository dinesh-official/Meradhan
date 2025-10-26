interface MenuItem {
  title: string;
  href?: string;
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    title: "Products",

    children: [
      { title: "All Bonds", href: "/bonds" },
      { title: "Latest Bonds", href: "/bonds/latest-release" },
      { title: "Bank Bonds", href: "/bonds/bank" },
      { title: "Corporate Bonds", href: "/bonds/corporate" },
      { title: "PSU Bonds", href: "/bonds/psu" },
      { title: "NBFC Bonds", href: "/bonds/nbfc" },
      { title: "Perpetual Bonds", href: "/bonds/perpetual" },
      { title: "Zero Coupon Bonds", href: "/bonds/zero-coupon" },
      { title: "Tax Free Bonds", href: "/bonds/tax-free" },
      { title: "Public Issues", href: "#" },
      { title: "Gold Bonds", href: "#" },
      { title: "IPO", href: "#" },
      {
        title: "Sovereign Bonds",
        children: [
          { title: "State Government", href: "#" },
          { title: "Central Government", href: "#" },
        ],
      },
      { title: "G-Sec", href: "#" },
      { title: "54EC - Capital Gain", href: "#" },
      { title: "Govt. Guaranteed Bonds", href: "#" },
    ],
  },
  {
    title: "Tools",

      children: [
      { title: "DhanGPT", href: "/dhangpt" },
      { title: "FD Calculator", href: "/fd-calculator" },
      { title: "XIRR Calculators", href: "/xirr-calculators" },
    ],
  },
  {
    title: "How it Works",
    href: "/blog",
  },
  {
    title: "Resources",
    children: [
      {
        title: "Product 1",
        children: [
          {
            title: "Product 1",
            href: "/about",
          },
          {
            title: "Product 2",
            href: "/blog",
          },
          {
            title: "Product 3",
            href: "/contact",
          },
        ],
      },
      {
        title: "Product 2",
        href: "/blog",
      },
      {
        title: "Product 3",
        href: "/contact",
      },
    ],
  },
];
