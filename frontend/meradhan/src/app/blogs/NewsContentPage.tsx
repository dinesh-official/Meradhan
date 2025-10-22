
import Breadcrumbs from "@/global/elements/Breadcrumb";
import BannerSubscribe from "@/global/elements/MarketUpdateBanner";
import React from "react";
import BondBlogsFilter from "./_components/section/BondBlogsFilter";
import BondBlogsGrid from "./_components/section/BondBlogsGrid";
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
  slug: "future-of-sustainable-finance-2025",
  title:
    "The Future of Sustainable Finance: How Green Bonds Are Transforming Global Markets",
  excerpt:
    "As sustainability becomes central to global policy, green bonds and ESG-driven investments are redefining how governments and corporations raise capital responsibly.",
  category: "Educative",
  image: "/avatars/blogpage.png", // ✅ wide banner image
  date: "10 Jul 2025",
  views: 248,
  author: {
    name: "Sourav Bapari",
    avatar: "/avatars/soarav.webp",
  },
};

const blogItems: NewsItem[] = [
  {
    id: 1,
    slug: "how-to-start-investing-in-bonds",
    title: "How to Start Investing in Bonds: A Beginner’s Guide",
    excerpt:
      "Learn the basics of bond investing, key terminologies, and strategies to build a stable income portfolio.",
    category: "Educative",
    image: "/avatars/blogpage.png",
    date: "10 Aug 2025",
    views: 77,
    author: { name: "Ritika Verma", avatar: "/avatars/avatar.jpg" },
  },
  {
    id: 2,
    slug: "importance-of-green-finance",
    title: "The Importance of Green Finance in 2025 and Beyond",
    excerpt:
      "As climate change reshapes financial priorities, green finance has emerged as a crucial pillar for sustainable growth.",
    category: "Educative",
    image: "/avatars/blogpage.png",
    date: "18 Aug 2025",
    views: 52,
    author: { name: "Aditya Kapoor", avatar: "/avatars/avatar.jpg" },
  },
  {
    id: 3,
    slug: "tips-for-long-term-investors",
    title: "5 Smart Tips for Long-Term Investors in a Volatile Market",
    excerpt:
      "Consistency and patience remain the key traits of successful investors — here’s how to apply them effectively.",
    category: "Educative",
    image: "/avatars/blogpage.png",
    date: "24 Aug 2025",
    views: 89,
    author: { name: "Sneha Rao", avatar: "/avatars/avatar.jpg" },
  },
  {
    id: 4,
    slug: "understanding-market-yields",
    title: "Understanding Market Yields: What Every Investor Should Know",
    excerpt:
      "Market yields directly affect your bond returns — discover how they work and how to use them to your advantage.",
    category: "Educative",
    image: "/avatars/blogpage.png",
    date: "30 Aug 2025",
    views: 61,
    author: { name: "Rajesh Patel", avatar: "/avatars/avatar.jpg" },
  },
  {
    id: 5,
    slug: "top-10-mutual-funds-to-watch",
    title: "Top 10 Mutual Funds to Watch in 2025",
    excerpt:
      "A look at some of the most promising mutual funds offering strong returns and sustainable investment goals.",
    category: "Educative",
    image: "/avatars/blogpage.png",
    date: "05 Sep 2025",
    views: 134,
    author: { name: "Divya Singh", avatar: "/avatars/avatar.jpg" },
  },
];

const NewsContentPage = () => {
  return (
    <>
      <div className="flex flex-col justify-center w-[70%] mx-auto mt-5">
        <div className="flex justify-start items-center p-3">
          {/* <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/news">News</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{featured.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: " Latest Blogs" },
            ]}
          />
        </div>
        <div className="w-full h-px bg-gray-300 my-4" />
        <div className="mb-6 mt-5">
          <p className="text-3xl tracking-tight">
            MeraDhan <span className="text-[#ef4822]">Blogs</span>
          </p>
        </div>
        <BondBlogsFilter />
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
          <BondBlogsGrid items={blogItems} />
        </div>
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

export default NewsContentPage;
