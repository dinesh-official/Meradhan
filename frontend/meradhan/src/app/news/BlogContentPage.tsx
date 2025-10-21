import React from "react";
import BondNewsGrid from "./_components/section/BondNewsGrid";
import Breadcrumbs from "../../global/elements/Breadcrumb";
import BondNewsFilter from "./_components/section/BondNewsFilter";
import BannerSubscribe from "../../global/elements/MarketUpdateBanner";
import FeaturedBox from "@/global/elements/FeaturedBox";

type NewsItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string; // "08 Jul 2025"
  views: number;
  author: Author;
};

type Author = {
  name: string;
  avatar: string;
};
const featured: NewsItem = {
  id: 101,
  slug: "save-our-planet-green-bonds",
  title: "Global Green Bonds Surge as Investors Seek Sustainability",
  excerpt:
    "Eco-friendly debt is booming as governments and corporates finance renewable energy and resilient infrastructure.",
  category: "Bonds News",
  image: "/avatars/soarav.webp", // big banner
  date: "08 Jul 2025",
  views: 8,
  author: { name: "Sourav Bapari", avatar: "/avatars/avatar.jpg" },
};

const bondNews: NewsItem[] = [
  {
    id: 1,
    slug: "govt-issues-sovereign-green-bonds",
    title: "Government Issues $1.5B in Sovereign Green Bonds",
    excerpt:
      "Proceeds will fund clean transport, energy efficiency and urban sustainability projects.",
    category: "Bonds News",
    image: "/avatars/soarav.webp", // big banner
    date: "15 Jul 2025",
    views: 42,
    author: { name: "Priya Sharma", avatar: "/avatars/avatar.jpg" },
  },
  {
    id: 2,
    slug: "corporate-bonds-hold-strong",
    title: "Corporate Bond Demand Holds Despite Uncertainty",
    excerpt:
      "Blue-chip issuers see solid books as investors rotate into longer duration.",
    category: "Bonds News",
    image: "/avatars/soarav.webp", // big banner
    date: "21 Jul 2025",
    views: 63,
    author: { name: "Rahul Mehta", avatar: "/avatars/avatar.jpg" },
  },
  {
    id: 3,
    slug: "tax-incentives-for-green-bonds",
    title: "New Tax Incentives Announced for Green Bond Investors",
    excerpt:
      "Finance ministry sweetens the pot to accelerate sustainable finance adoption.",
    category: "Bonds News",
    image: "/avatars/soarav.webp", // big banner
    date: "01 Aug 2025",
    views: 29,
    author: { name: "Ananya Das", avatar: "/avatars/avatar.jpg" },
  },
  // add more items as needed…
];

const BlogContentPage = () => {
  return (
    <>
      <div className="flex flex-col justify-center w-[70%] mx-auto mt-5">
        <div className="flex justify-start items-center p-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "News", href: "/news" },
              { label: "Latest News" },
            ]}
          />
        </div>

        <div className="w-full h-px bg-gray-300 my-4" />

        <div className="mb-6 mt-5">
          <p className="text-3xl tracking-tight">
            MeraDhan <span className="text-[#ef4822] ">News</span>
          </p>
        </div>
        <BondNewsFilter />
        <div>
          <FeaturedBox
            id={featured.id}
            slug={featured.slug}
            title={featured.title}
            excerpt={featured.excerpt}
            category={featured.category}
            image={featured.image}
            date={featured.date}
            views={featured.views}
            author={featured.author}
          />
        </div>
        <div>
          <BondNewsGrid items={bondNews} />
        </div>
        <div></div>
      </div>
      <div>
        <BannerSubscribe
          title="Stay up-to-date with market updates!"
          subtitle="Subscribe to our newsletter!"
        />
      </div>
    </>
  );
};

export default BlogContentPage;
