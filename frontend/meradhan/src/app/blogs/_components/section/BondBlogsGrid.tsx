import { Eye, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export type Author = {
  name: string;
  avatar: string;
};

type BondNewsGridItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  views: number;
  author: Author;
};

type BondNewsGridProps = {
  items: BondNewsGridItem[]; // ✅ data comes as prop
};

const BondBlogsGrid = ({ items }: BondNewsGridProps) => {
  return (
    <section className="mb-16">
      <div className="grid md:grid-cols-3 gap-8">
        {items.map((n) => (
          <article key={n.id} className="rounded-xl p-3">
            <Link href={`/news/${n.slug}`}>
              <Image
                src={n.image}
                alt={n.title}
                width={600}
                height={340}
                className="w-full aspect-video object-cover rounded-lg"
              />
            </Link>

            <div className="mt-3 flex items-center justify-between">
              <span className="inline-block text-xs font-medium bg-[#7fabd2] text-white px-2 py-1 rounded-md">
                {n.category}
              </span>
              <span className="text-sm text-gray-500">{n.date}</span>
            </div>

            <Link href={`/news/${n.slug}`}>
              <h3 className="mt-2 text-lg leading-tight hover:underline line-clamp-2">
                {n.title}
              </h3>
            </Link>
            <p className="mt-1 text-gray-600 line-clamp-2">{n.excerpt}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={n.author.avatar}
                    alt={n.author.name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="text-sm text-gray-700">{n.author.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500 mt-3">
              <span className="flex items-center gap-1 text-sm">
                <Eye className="h-4 w-4" /> {n.views}
              </span>
              <button aria-label="Share" className="hover:text-gray-700">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BondBlogsGrid;
