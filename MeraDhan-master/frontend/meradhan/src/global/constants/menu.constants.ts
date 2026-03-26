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
      // { title: "Perpetual Bonds", href: "/bonds/perpetual" },
      { title: "Zero Coupon Bonds", href: "/bonds/zero-coupon" },
      // { title: "Tax Free Bonds", href: "/bonds/tax-free" },
      // { title: "Public Issues", href: "#" },
      // { title: "Gold Bonds", href: "#" },
      // { title: "IPO", href: "#" },
      // {
      //   title: "Sovereign Bonds",
      //   children: [
      //     { title: "State Government", href: "#" },
      //     { title: "Central Government", href: "#" },
      //   ],
      // },
      // { title: "G-Sec", href: "#" },
      // { title: "54EC - Capital Gain", href: "#" },
      // { title: "Govt. Guaranteed Bonds", href: "#" },
    ],
  },
  {
    title: "Tools",

    children: [
      { title: "MeraDhan-GPT", href: "/dhangpt" },
      // { title: "FD Calculator", href: "/fd-calculator" },
      // { title: "YTM Calculator", href: "/ytm-calculator" },
    ],
  },
  // {
  //   title: "How it Works",
  //   href: "/blog",
  // },
  {
    title: "Resources",
    children: [
      // {
      //   title: "Blog",
      //   href: "/blog",
      // },
      // {
      //   title: "News",
      //   href: "/news",
      // },
      // {
      //   title: "Economic Calendar",
      //   href: "/economic-calendar",
      // },
      // {
      //   title: "Research Reports",
      //   href: "/news#",
      // },
      {
        title: "Glossary",
        href: "/glossary",
      },
      // {
      //   title: "Issuer Notes",
      //   href: "/issuer-notes",
      // },
      // {
      //   title: "Regulatory Circulars",
      //   href: "/regulatory-circulars",
      // },
      {
        title: "FAQs",
        href: "/faqs",
      },
    ],
  },
];
